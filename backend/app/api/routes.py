from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.models.schemas import SearchQuery, SearchResult
from app.services.vector_store import VectorStore
from app.services.llm_service import LLMService
import json
from collections import Counter

router = APIRouter()
vector_store = VectorStore()
llm_service = LLMService()

@router.post("/search")
async def search_papers(query: SearchQuery) -> Dict[str, Any]:
    """
    Search for papers with improved relevance scoring.
    Uses reranking for better results.
    """
    try:
        filter_dict = None
        if query.filters:
            filter_dict = {}
            if query.filters.get("year"):
                filter_dict["year"] = {"$eq": query.filters["year"]}
            if query.filters.get("organisms"):
                filter_dict["organisms"] = {"$in": query.filters["organisms"]}
            if query.filters.get("section"):
                filter_dict["section"] = {"$eq": query.filters["section"]}
        
        # Use improved search with reranking
        # Boost abstract and results sections for better relevance
        raw_results = vector_store.search_with_reranking(
            query=query.query,
            top_k=query.top_k,
            filter_dict=filter_dict,
            boost_sections=["abstract", "results", "conclusion"]
        )
        
        # Transform results to match frontend expectations
        transformed_results = []
        for r in raw_results:
            metadata = r.get("metadata", {})
            
            # Extract text from metadata and remove it
            text = metadata.get("text", "")
            
            # Create a clean metadata dict without text
            clean_metadata = {
                "file": metadata.get("title", "Unknown") + ".pdf",
                "page": metadata.get("chunk_index", 0),
                "chunk": metadata.get("chunk_index", 0),
                "year": metadata.get("year"),
                "organisms": metadata.get("organisms", []),
                "section": metadata.get("section", ""),
                "paper_id": metadata.get("paper_id", ""),
                "keywords": metadata.get("keywords", []),
                "experiment_type": metadata.get("experiment_type", ""),
                "space_conditions": metadata.get("space_conditions", [])
            }
            
            transformed_results.append({
                "id": r.get("id"),
                "score": r.get("score"),
                "text": text,
                "metadata": clean_metadata
            })
        
        print(f"Search returned {len(transformed_results)} results")
        if transformed_results:
            avg_score = sum(r['score'] for r in transformed_results) / len(transformed_results)
            print(f"Average relevance score: {avg_score:.3f}")
            print(f"Top score: {transformed_results[0]['score']:.3f}")
        
        return {
            "results": transformed_results,
            "count": len(transformed_results),
            "query": query.query
        }
    except Exception as e:
        print(f"Error in search_papers: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize")
async def summarize_results(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate persona-specific summaries from search results.
    Results from /search have text at top level.
    """
    try:
        query = data.get("query", "")
        results = data.get("results", [])
        persona = data.get("persona", "scientist")
        
        print(f"=== SUMMARIZE REQUEST ===")
        print(f"Query: {query}")
        print(f"Persona: {persona}")
        print(f"Number of results: {len(results)}")
        
        if not results:
            return {
                "summary": "No results to summarize",
                "key_points": [],
                "persona": persona
            }
        
        # Extract text from results
        texts = []
        for i, r in enumerate(results[:5]):
            # Text should be at top level after transformation
            text = r.get("text", "")
            
            print(f"Result {i}: has 'text' key: {bool(text)}, length: {len(text) if text else 0}")
            
            if text and text.strip():
                texts.append(text)
        
        print(f"Extracted {len(texts)} valid texts for summarization")
        
        if not texts:
            print("ERROR: No valid texts found in results!")
            print(f"Sample result keys: {list(results[0].keys()) if results else 'No results'}")
            return {
                "summary": "Unable to extract text from results. Please try searching again.",
                "key_points": [],
                "persona": persona
            }
        
        context_map = {
            "scientist": "Provide a detailed scientific summary highlighting methodology, findings, and implications for future research.",
            "investor": "Provide a summary focused on commercial potential, emerging trends, technology readiness, and investment opportunities.",
            "architect": "Provide a summary focused on practical mission applications, technical requirements, constraints, and risk factors."
        }
        
        context = context_map.get(persona, context_map["scientist"])
        
        print(f"Calling LLM service with {len(texts)} texts...")
        result = llm_service.generate_summary(texts, context)
        
        print(f"LLM returned summary: {bool(result.get('summary'))}")
        
        return {
            "summary": result.get("summary", ""),
            "key_points": result.get("key_points", []),
            "papers_analyzed": len(results),
            "persona": persona
        }
    except Exception as e:
        print(f"Error in summarize_results: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/consensus")
async def analyze_consensus(data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        topic = data.get("topic", "")
        results = data.get("results", [])
        
        if not results:
            return {"error": "No results to analyze"}
        
        # Extract text from top level
        texts = []
        for r in results[:8]:
            text = r.get("text", "")
            if text and text.strip():
                texts.append(text)
        
        analysis = llm_service.analyze_consensus(texts, topic)
        
        try:
            parsed_analysis = json.loads(analysis)
        except json.JSONDecodeError:
            analysis_clean = analysis.strip()
            if analysis_clean.startswith("```json"):
                analysis_clean = analysis_clean[7:]
            if analysis_clean.startswith("```"):
                analysis_clean = analysis_clean[3:]
            if analysis_clean.endswith("```"):
                analysis_clean = analysis_clean[:-3]
            analysis_clean = analysis_clean.strip()
            parsed_analysis = json.loads(analysis_clean)
        
        return {
            "analysis": parsed_analysis,
            "papers_analyzed": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gaps")
async def identify_gaps(data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        results = data.get("results", [])

        if not results:
            # Get fresh results from vector store
            raw_results = vector_store.search(query="space biology research", top_k=50)
            # These need transformation too!
            all_results = []
            for r in raw_results:
                metadata = r.get("metadata", {})
                all_results.append({
                    "text": metadata.get("text", ""),
                    "metadata": metadata
                })
        else:
            all_results = results

        # Extract text from top level
        texts = []
        for r in all_results[:15]:
            text = r.get("text", "")
            if text and text.strip():
                texts.append(text)
        
        metadata_list = [r.get("metadata", {}) for r in all_results]

        gaps = llm_service.identify_gaps(texts, metadata_list)

        try:
            parsed_gaps = json.loads(gaps)
        except json.JSONDecodeError:
            gaps_clean = gaps.strip()
            if gaps_clean.startswith("```json"):
                gaps_clean = gaps_clean[7:]
            if gaps_clean.startswith("```"):
                gaps_clean = gaps_clean[3:]
            if gaps_clean.endswith("```"):
                gaps_clean = gaps_clean[:-3]
            gaps_clean = gaps_clean.strip()
            parsed_gaps = json.loads(gaps_clean)

        return parsed_gaps
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trends")
async def analyze_trends() -> Dict[str, Any]:
    try:
        results = vector_store.search(query="space biology research overview", top_k=100)

        years = []
        organisms = []
        topics = []
        organism_year_map = {}
        topic_year_map = {}
        organism_pairs = []

        for r in results:
            metadata = r.get("metadata", {})
            year = metadata.get("year")
            
            if year:
                years.append(year)
                
                if metadata.get("organisms"):
                    for org in metadata["organisms"]:
                        organisms.append(org)
                        key = f"{org}_{year}"
                        organism_year_map[key] = organism_year_map.get(key, 0) + 1
                
                if metadata.get("keywords"):
                    for kw in metadata["keywords"]:
                        topics.append(kw)
                        key = f"{kw}_{year}"
                        topic_year_map[key] = topic_year_map.get(key, 0) + 1
                
                orgs = metadata.get("organisms", [])
                if len(orgs) >= 2:
                    for i in range(len(orgs)):
                        for j in range(i+1, len(orgs)):
                            pair = tuple(sorted([orgs[i], orgs[j]]))
                            organism_pairs.append(pair)

        year_counts = Counter(years)
        organism_counts = Counter(organisms)
        topic_counts = Counter(topics)
        organism_pair_counts = Counter(organism_pairs)

        temporal_analysis = calculate_temporal_trends(year_counts, organism_year_map, topic_year_map)
        collaboration_network = calculate_collaboration_network(organism_pair_counts, organism_counts)
        emerging = identify_emerging_areas(topic_counts, year_counts, topic_year_map)

        return {
            "research_by_year": dict(year_counts),
            "top_organisms": dict(organism_counts.most_common(10)),
            "top_topics": dict(topic_counts.most_common(15)),
            "emerging_areas": emerging,
            "temporal_analysis": temporal_analysis,
            "collaboration_network": collaboration_network,
            "organism_trends_by_year": format_organism_trends(organism_year_map, organism_counts),
            "topic_evolution": calculate_topic_evolution(topic_year_map, year_counts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_temporal_trends(year_counts: Counter, organism_year_map: dict, topic_year_map: dict) -> dict:
    sorted_years = sorted(year_counts.keys())
    if len(sorted_years) < 2:
        return {"growth_rate": 0, "trend": "insufficient_data"}
    
    first_half = sum(year_counts[y] for y in sorted_years[:len(sorted_years)//2])
    second_half = sum(year_counts[y] for y in sorted_years[len(sorted_years)//2:])
    
    growth_rate = ((second_half - first_half) / first_half * 100) if first_half > 0 else 0
    
    return {
        "growth_rate": round(growth_rate, 2),
        "trend": "accelerating" if growth_rate > 20 else "steady" if growth_rate > -20 else "declining",
        "peak_year": max(year_counts, key=year_counts.get),
        "peak_papers": year_counts[max(year_counts, key=year_counts.get)]
    }

def calculate_collaboration_network(organism_pair_counts: Counter, organism_counts: Counter) -> list:
    network = []
    for (org1, org2), count in organism_pair_counts.most_common(10):
        network.append({
            "organism1": org1,
            "organism2": org2,
            "co_occurrences": count,
            "strength": round(count / min(organism_counts[org1], organism_counts[org2]), 2)
        })
    return network

def format_organism_trends(organism_year_map: dict, organism_counts: Counter) -> list:
    organism_trends = {}
    
    for key, count in organism_year_map.items():
        org, year = key.rsplit('_', 1)
        if org not in organism_trends:
            organism_trends[org] = {}
        organism_trends[org][year] = count
    
    result = []
    for org in list(organism_counts.most_common(10)):
        org_name = org[0]
        trend_data = organism_trends.get(org_name, {})
        sorted_years = sorted(trend_data.keys())
        
        if len(sorted_years) >= 2:
            early = sum(trend_data[y] for y in sorted_years[:len(sorted_years)//2])
            late = sum(trend_data[y] for y in sorted_years[len(sorted_years)//2:])
            velocity = ((late - early) / early * 100) if early > 0 else 0
        else:
            velocity = 0
        
        result.append({
            "organism": org_name,
            "total_papers": org[1],
            "trend_data": trend_data,
            "velocity": round(velocity, 2),
            "status": "rising" if velocity > 30 else "stable" if velocity > -30 else "declining"
        })
    
    return result

def calculate_topic_evolution(topic_year_map: dict, year_counts: Counter) -> list:
    topic_timeline = {}
    
    for key, count in topic_year_map.items():
        topic, year = key.rsplit('_', 1)
        if topic not in topic_timeline:
            topic_timeline[topic] = {}
        topic_timeline[topic][year] = count
    
    evolution = []
    for topic, timeline in topic_timeline.items():
        if len(timeline) >= 3:
            sorted_years = sorted(timeline.keys())
            recent = sorted_years[-3:]
            recent_total = sum(timeline[y] for y in recent)
            
            if recent_total >= 5:
                evolution.append({
                    "topic": topic,
                    "timeline": timeline,
                    "recent_momentum": recent_total,
                    "first_seen": min(sorted_years),
                    "last_seen": max(sorted_years)
                })
    
    return sorted(evolution, key=lambda x: x["recent_momentum"], reverse=True)[:15]

def identify_emerging_areas(topic_counts: Counter, year_counts: Counter, topic_year_map: dict = None) -> list:
    if not year_counts:
        return []
    
    if not topic_year_map:
        recent_years = sorted(year_counts.keys())[-3:]
        avg_count = sum(topic_counts.values()) / len(topic_counts) if topic_counts else 0
        
        emerging = []
        for topic, count in topic_counts.items():
            if count > avg_count * 1.5:
                emerging.append(topic)
        
        return emerging[:5]
    
    sorted_years = sorted(year_counts.keys())
    recent_years = sorted_years[-3:]
    older_years = sorted_years[:-3] if len(sorted_years) > 3 else []
    
    emerging = []
    
    for topic, total_count in topic_counts.items():
        recent_count = sum(
            topic_year_map.get(f"{topic}_{year}", 0) 
            for year in recent_years
        )
        older_count = sum(
            topic_year_map.get(f"{topic}_{year}", 0) 
            for year in older_years
        ) if older_years else 0
        
        if recent_count >= 3:
            growth = ((recent_count - older_count) / older_count * 100) if older_count > 0 else 100
            
            if growth > 50:
                emerging.append({
                    "topic": topic,
                    "recent_papers": recent_count,
                    "growth_rate": round(growth, 2),
                    "total_papers": total_count
                })
    
    return sorted(emerging, key=lambda x: x["growth_rate"], reverse=True)[:8]

@router.get("/filters")
async def get_available_filters() -> Dict[str, Any]:
    try:
        results = vector_store.search(query="space biology", top_k=100)
        
        years = set()
        organisms = set()
        sections = set()
        
        for r in results:
            metadata = r.get("metadata", {})
            if metadata.get("year"):
                years.add(metadata["year"])
            if metadata.get("organisms"):
                organisms.update(metadata["organisms"])
            if metadata.get("section"):
                sections.add(metadata["section"])
        
        return {
            "years": sorted(list(years)),
            "organisms": sorted(list(organisms)),
            "sections": sorted(list(sections))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_statistics() -> Dict[str, Any]:
    try:
        stats = vector_store.get_all_metadata()
        
        results = vector_store.search(query="space biology", top_k=100)
        
        paper_ids = set()
        for r in results:
            paper_ids.add(r.get("metadata", {}).get("paper_id"))
        
        return {
            "total_vectors": stats.get("total_vector_count", 0),
            "total_papers": len(paper_ids),
            "index_fullness": stats.get("index_fullness", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
