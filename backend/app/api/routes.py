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

        for r in results:
            metadata = r.get("metadata", {})
            if metadata.get("year"):
                years.append(metadata["year"])
            if metadata.get("organisms"):
                organisms.extend(metadata["organisms"])
            if metadata.get("keywords"):
                topics.extend(metadata["keywords"])

        year_counts = Counter(years)
        organism_counts = Counter(organisms)
        topic_counts = Counter(topics)

        emerging = identify_emerging_areas(topic_counts, year_counts)

        return {
            "research_by_year": dict(year_counts),
            "top_organisms": dict(organism_counts.most_common(10)),
            "top_topics": dict(topic_counts.most_common(15)),
            "emerging_areas": emerging
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def identify_emerging_areas(topic_counts: Counter, year_counts: Counter) -> list:
    if not year_counts:
        return []
    
    recent_years = sorted(year_counts.keys())[-3:]
    avg_count = sum(topic_counts.values()) / len(topic_counts) if topic_counts else 0
    
    emerging = []
    for topic, count in topic_counts.items():
        if count > avg_count * 1.5:
            emerging.append(topic)
    
    return emerging[:5]

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
