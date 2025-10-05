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
        
        raw_results = vector_store.search_with_reranking(
            query=query.query,
            top_k=query.top_k,
            filter_dict=filter_dict,
            boost_sections=["abstract", "results", "conclusion"]
        )
        
        transformed_results = []
        for r in raw_results:
            metadata = r.get("metadata", {})
            text = metadata.get("text", "")
            
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
    try:
        query = data.get("query", "")
        results = data.get("results", [])
        persona = data.get("persona", "scientist")
        
        if not results:
            return {
                "summary": "No results to summarize. Please try searching again.",
                "key_points": [],
                "persona": persona
            }
        
        texts = []
        for r in results[:10]:
            text = r.get("text", "")
            if text and text.strip():
                texts.append(text)
        
        if not texts:
            return {
                "summary": "No valid text content found in results. Please try searching again.",
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

def safe_int_year(year_value) -> Optional[int]:
    """Safely convert year to int, handling floats and strings"""
    if year_value is None:
        return None
    try:
        if isinstance(year_value, str):
            year_value = float(year_value)
        return int(year_value)
    except (ValueError, TypeError):
        return None

@router.post("/gaps")
async def identify_gaps(data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        raw_results = vector_store.get_all_papers_metadata(max_fetch=500)
        all_results = [r.get("metadata", {}) for r in raw_results]

        under_researched = identify_coverage_gaps(all_results)
        comparative_gaps = identify_comparative_gaps(all_results)
        
        under_researched_list = [g["area"] for g in under_researched[:10]]
        
        missing_approaches = [
            "Long-duration (>6 months) studies on multiple organisms",
            "Molecular pathway analysis across different species",
            "Integrated multi-omics approaches",
            "Countermeasure validation studies"
        ]
        
        critical_questions = [
            "How do combined space stressors (radiation + microgravity) affect biological systems?",
            "What are the minimum gravity thresholds for normal biological function?",
            "Can artificial gravity effectively mitigate space-induced changes?",
            "What are the transgenerational effects of space exposure?"
        ]
        
        recommendations = [
            "Increase research on under-studied organisms with high mission relevance",
            "Conduct more comparative studies across multiple species",
            "Focus on molecular mechanisms underlying observed phenotypes",
            "Develop standardized protocols for space biology experiments"
        ]
        
        return {
            "under_researched_areas": under_researched_list,
            "missing_approaches": missing_approaches,
            "critical_questions": critical_questions,
            "recommendations": recommendations,
            "quantitative_scoring": under_researched,
            "comparative_analysis": comparative_gaps
        }
    except Exception as e:
        print(f"Error in identify_gaps: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

def identify_coverage_gaps(metadata_list: list[dict]) -> list[dict]:
    organism_coverage = {}
    year_coverage = {}
    topic_coverage = {}
    
    for meta in metadata_list:
        if meta.get("organisms"):
            for org in meta["organisms"]:
                organism_coverage[org] = organism_coverage.get(org, 0) + 1
        
        year = safe_int_year(meta.get("year"))
        if year:
            year_coverage[year] = year_coverage.get(year, 0) + 1
        
        if meta.get("keywords"):
            for kw in meta["keywords"]:
                topic_coverage[kw] = topic_coverage.get(kw, 0) + 1
    
    gaps = []
    avg_organism_papers = sum(organism_coverage.values()) / len(organism_coverage) if organism_coverage else 1
    avg_topic_papers = sum(topic_coverage.values()) / len(topic_coverage) if topic_coverage else 1
    
    for organism, count in organism_coverage.items():
        if count < avg_organism_papers * 0.5:
            severity = 10 - int((count / avg_organism_papers) * 10)
            gaps.append({
                "type": "organism",
                "area": organism,
                "paper_count": count,
                "severity_score": min(severity, 10),
                "reason": "Under-studied relative to average"
            })
    
    for topic, count in topic_coverage.items():
        if count < avg_topic_papers * 0.3:
            severity = 10 - int((count / avg_topic_papers) * 10)
            gaps.append({
                "type": "topic",
                "area": topic,
                "paper_count": count,
                "severity_score": min(severity, 10),
                "reason": "Minimal research coverage"
            })
    
    if len(year_coverage) >= 3:
        sorted_years = sorted(year_coverage.keys())
        recent_years = sorted_years[-3:]
        min_year = sorted_years[0]
        max_year = sorted_years[-1]
        
        for year in range(min_year, max_year + 1):
            if year not in year_coverage and year not in recent_years:
                gaps.append({
                    "type": "temporal",
                    "area": f"Research from {year}",
                    "paper_count": 0,
                    "severity_score": 7,
                    "reason": "No publications in this year"
                })
    
    return sorted(gaps, key=lambda x: x['severity_score'], reverse=True)[:15]

def identify_comparative_gaps(metadata_list: list[dict]) -> dict:
    organism_condition_matrix = {}
    
    for meta in metadata_list:
        organisms = meta.get('organisms', [])
        conditions = meta.get('space_conditions', [])
        
        for org in organisms:
            if org not in organism_condition_matrix:
                organism_condition_matrix[org] = {}
            
            for cond in conditions:
                organism_condition_matrix[org][cond] = organism_condition_matrix[org].get(cond, 0) + 1
    
    all_organisms = list(organism_condition_matrix.keys())
    all_conditions = set()
    for conds in organism_condition_matrix.values():
        all_conditions.update(conds.keys())
    
    cross_gaps = []
    for org in all_organisms:
        for cond in all_conditions:
            if cond not in organism_condition_matrix[org]:
                cross_gaps.append({
                    "organism": org,
                    "condition": cond,
                    "status": "not_studied"
                })
    
    return {
        "organism_condition_gaps": cross_gaps[:20],
        "total_combinations": len(all_organisms) * len(all_conditions),
        "studied_combinations": sum(len(conds) for conds in organism_condition_matrix.values()),
        "coverage_percentage": round((sum(len(conds) for conds in organism_condition_matrix.values()) / (len(all_organisms) * len(all_conditions)) * 100), 2) if all_organisms and all_conditions else 0
    }

def calculate_temporal_trends(year_counts: Counter, organism_year_map: dict, topic_year_map: dict) -> dict:
    years = sorted(year_counts.keys())
    if len(years) < 2:
        return {
            "growth_rate": 0,
            "trend": "insufficient_data",
            "peak_year": str(years[0]) if years else "unknown",
            "peak_papers": year_counts[years[0]] if years else 0
        }
    
    recent_avg = sum(year_counts[y] for y in years[-3:]) / 3 if len(years) >= 3 else year_counts[years[-1]]
    older_avg = sum(year_counts[y] for y in years[:3]) / 3 if len(years) >= 3 else year_counts[years[0]]
    
    growth_rate = ((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0
    
    peak_year = max(years, key=lambda y: year_counts[y])
    
    return {
        "growth_rate": round(growth_rate, 2),
        "trend": "growing" if growth_rate > 10 else "stable" if growth_rate > -10 else "declining",
        "peak_year": str(peak_year),
        "peak_papers": year_counts[peak_year]
    }

def calculate_collaboration_network(organism_pair_counts: Counter, organism_counts: Counter) -> list:
    network = []
    for (org1, org2), count in organism_pair_counts.most_common(15):
        total_org1 = organism_counts[org1]
        total_org2 = organism_counts[org2]
        strength = count / min(total_org1, total_org2) if min(total_org1, total_org2) > 0 else 0
        
        network.append({
            "organism1": org1,
            "organism2": org2,
            "co_occurrences": count,
            "strength": round(strength, 3)
        })
    
    return network

def identify_emerging_areas(topic_counts: Counter, year_counts: Counter, topic_year_map: dict) -> list:
    years = sorted(year_counts.keys())
    if len(years) < 3:
        return []
    
    recent_years = years[-3:]
    older_years = years[:-3]
    
    emerging = []
    
    for topic, total_count in topic_counts.most_common(30):
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
        results = vector_store.get_all_papers_metadata(max_fetch=500)
        
        years = set()
        organisms = set()
        sections = set()
        
        for r in results:
            metadata = r.get("metadata", {})
            year = safe_int_year(metadata.get("year"))
            if year:
                years.add(year)
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
        
        if isinstance(stats, dict):
            total_vectors = (
                stats.get("total_vector_count") or 
                stats.get("namespaces", {}).get("", {}).get("vector_count", 0)
            )
            index_fullness = stats.get("index_fullness", 0.0)
        else:
            total_vectors = getattr(stats, 'total_vector_count', 0)
            if hasattr(stats, 'namespaces') and hasattr(stats.namespaces, ''):
                ns = getattr(stats.namespaces, '')
                if hasattr(ns, 'vector_count'):
                    total_vectors = ns.vector_count
            index_fullness = getattr(stats, 'index_fullness', 0.0)
        
        results = vector_store.get_all_papers_metadata(max_fetch=500)
        
        paper_ids = set()
        for r in results:
            paper_id = r.get("metadata", {}).get("paper_id")
            if paper_id:
                paper_ids.add(paper_id)
        
        print(f"Stats: {total_vectors} vectors, {len(paper_ids)} unique papers")
        
        return {
            "total_vectors": total_vectors,
            "total_papers": len(paper_ids),
            "index_fullness": index_fullness
        }
    except Exception as e:
        print(f"Stats error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends")
async def analyze_trends() -> Dict[str, Any]:
    try:
        results = vector_store.get_all_papers_metadata(max_fetch=500)

        years = []
        organisms = []
        topics = []
        organism_year_map = {}
        topic_year_map = {}
        organism_pairs = []

        for r in results:
            metadata = r.get("metadata", {})
            year = safe_int_year(metadata.get("year"))
            
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

        research_by_year = {str(k): v for k, v in year_counts.items()}

        print(f"Trends: {len(year_counts)} years, {len(organism_counts)} organisms, {len(topic_counts)} topics")

        return {
            "research_by_year": research_by_year,
            "top_organisms": dict(organism_counts.most_common(10)),
            "top_topics": dict(topic_counts.most_common(10)),
            "emerging_areas": emerging,
            "temporal_analysis": temporal_analysis,
            "collaboration_network": collaboration_network,
            "organism_trends_by_year": [],
            "topic_evolution": []
        }
    except Exception as e:
        print(f"Trends error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
