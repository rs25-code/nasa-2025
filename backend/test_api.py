import httpx
import json
import asyncio
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api"

class APITester:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=60.0)
    
    async def test_stats(self):
        print("\n" + "="*60)
        print("Testing /api/stats")
        print("="*60)
        
        response = await self.client.get(f"{BASE_URL}/stats")
        data = response.json()
        
        print(f"✓ Total Papers: {data['total_papers']}")
        print(f"✓ Total Vectors: {data['total_vectors']}")
        print(f"✓ Index Fullness: {data['index_fullness']}")
    
    async def test_filters(self):
        print("\n" + "="*60)
        print("Testing /api/filters")
        print("="*60)
        
        response = await self.client.get(f"{BASE_URL}/filters")
        data = response.json()
        
        print(f"✓ Available Years: {data['years']}")
        print(f"✓ Available Organisms: {data['organisms'][:5]}...")
        print(f"✓ Available Sections: {data['sections']}")
    
    async def test_search(self):
        print("\n" + "="*60)
        print("Testing /api/search")
        print("="*60)
        
        queries = [
            "microgravity effects on muscle tissue",
            "radiation exposure in space",
            "plant growth in space conditions"
        ]
        
        for query in queries:
            response = await self.client.post(
                f"{BASE_URL}/search",
                json={"query": query, "top_k": 3}
            )
            data = response.json()
            
            print(f"\nQuery: '{query}'")
            print(f"Results found: {data['count']}")
            
            if data['results']:
                top_result = data['results'][0]
                print(f"Top result score: {top_result['score']:.3f}")
                print(f"Paper: {top_result['metadata'].get('title', 'N/A')[:80]}...")
    
    async def test_persona_summaries(self, search_results: list):
        print("\n" + "="*60)
        print("Testing Persona-Specific Summaries")
        print("="*60)
        
        personas = ["scientist", "investor", "architect"]
        query = "microgravity effects on organisms"
        
        for persona in personas:
            response = await self.client.post(
                f"{BASE_URL}/summarize",
                json={
                    "query": query,
                    "results": search_results,
                    "persona": persona
                }
            )
            data = response.json()
            
            print(f"\n--- {persona.upper()} Persona ---")
            print(f"Summary length: {len(data['summary'])} chars")
            print(f"Preview: {data['summary'][:200]}...")
    
    async def test_consensus(self, search_results: list):
        print("\n" + "="*60)
        print("Testing Consensus Analysis")
        print("="*60)
        
        response = await self.client.post(
            f"{BASE_URL}/consensus",
            json={
                "topic": "space radiation effects",
                "results": search_results
            }
        )
        data = response.json()
        
        analysis = data['analysis']
        print(f"\nConsensus Points: {len(analysis.get('consensus_points', []))}")
        for point in analysis.get('consensus_points', [])[:3]:
            print(f"  • {point}")
        
        print(f"\nDisagreements: {len(analysis.get('disagreements', []))}")
        for disagreement in analysis.get('disagreements', [])[:2]:
            print(f"  • {disagreement}")
        
        print(f"\nConfidence Level: {analysis.get('confidence', 'unknown')}")
    
    async def test_gaps(self):
        print("\n" + "="*60)
        print("Testing Gap Analysis")
        print("="*60)
        
        response = await self.client.post(
            f"{BASE_URL}/gaps",
            json={"results": []}
        )
        data = response.json()
        
        gaps = data['gaps']
        
        print(f"\nUnder-researched Areas:")
        for area in gaps.get('under_researched_areas', [])[:3]:
            print(f"  • {area}")
        
        print(f"\nMissing Approaches:")
        for approach in gaps.get('missing_approaches', [])[:3]:
            print(f"  • {approach}")
        
        print(f"\nCritical Questions:")
        for question in gaps.get('critical_questions', [])[:3]:
            print(f"  • {question}")
    
    async def test_trends(self):
        print("\n" + "="*60)
        print("Testing Trend Analysis")
        print("="*60)
        
        response = await self.client.get(f"{BASE_URL}/trends")
        data = response.json()
        
        print(f"\nResearch by Year:")
        for year, count in list(data['temporal_trends']['research_by_year'].items())[:5]:
            print(f"  {year}: {count} papers")
        
        print(f"\nTop Organisms:")
        for organism, count in list(data['organism_trends']['top_organisms'].items())[:5]:
            print(f"  {organism}: {count} mentions")
        
        print(f"\nTop Topics:")
        for topic, count in list(data['topic_trends']['top_topics'].items())[:5]:
            print(f"  {topic}: {count} mentions")
        
        print(f"\nEmerging Areas:")
        for area in data.get('emerging_areas', [])[:5]:
            print(f"  • {area}")
    
    async def run_all_tests(self):
        print("\n" + "#"*60)
        print("# NASA Space Biology Knowledge Engine - API Test Suite")
        print("#"*60)
        
        try:
            await self.test_stats()
            await self.test_filters()
            await self.test_search()
            
            search_response = await self.client.post(
                f"{BASE_URL}/search",
                json={"query": "space biology research effects", "top_k": 10}
            )
            search_results = search_response.json()['results']
            
            await self.test_persona_summaries(search_results)
            await self.test_consensus(search_results)
            await self.test_gaps()
            await self.test_trends()
            
            print("\n" + "#"*60)
            print("# All Tests Completed Successfully! ✓")
            print("#"*60)
            
        except Exception as e:
            print(f"\n✗ Test failed: {str(e)}")
        finally:
            await self.client.aclose()

async def main():
    tester = APITester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
