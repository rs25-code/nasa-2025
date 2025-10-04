import httpx
import asyncio

BASE_URL = "http://localhost:8000/api"

SCIENTIST_QUERIES = [
    "What are the molecular mechanisms of muscle atrophy in microgravity?",
    "How does space radiation affect DNA repair mechanisms?",
    "What contradictions exist in plant growth studies under space conditions?",
    "Which organisms show the most significant adaptations to microgravity?"
]

INVESTOR_QUERIES = [
    "What are the emerging commercial opportunities in space biology research?",
    "Which research areas have shown the most growth in recent years?",
    "What technologies from space biology have terrestrial applications?",
    "What are the most under-invested areas with high potential?"
]

ARCHITECT_QUERIES = [
    "What are the critical biological constraints for long-duration space missions?",
    "Which countermeasures are most effective against space-induced health issues?",
    "What life support system requirements emerge from plant growth research?",
    "What are the radiation shielding requirements based on biological studies?"
]

async def test_persona_queries():
    client = httpx.AsyncClient(timeout=60.0)
    
    personas = {
        "scientist": SCIENTIST_QUERIES,
        "investor": INVESTOR_QUERIES,
        "architect": ARCHITECT_QUERIES
    }
    
    for persona, queries in personas.items():
        print("\n" + "="*70)
        print(f"Testing {persona.upper()} Queries")
        print("="*70)
        
        for i, query in enumerate(queries, 1):
            print(f"\n{i}. Query: {query}")
            print("-" * 70)
            
            search_response = await client.post(
                f"{BASE_URL}/search",
                json={"query": query, "top_k": 5}
            )
            search_data = search_response.json()
            
            print(f"   Results found: {search_data['count']}")
            
            if search_data['results']:
                summary_response = await client.post(
                    f"{BASE_URL}/summarize",
                    json={
                        "query": query,
                        "results": search_data['results'],
                        "persona": persona
                    }
                )
                summary_data = summary_response.json()
                
                print(f"\n   Summary ({persona}):")
                print(f"   {summary_data['summary'][:300]}...")
                
                if i < len(queries):
                    await asyncio.sleep(2)
    
    await client.aclose()
    print("\n" + "="*70)
    print("Persona testing complete!")
    print("="*70)

if __name__ == "__main__":
    asyncio.run(test_persona_queries())
