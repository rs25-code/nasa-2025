from openai import OpenAI
from app.config import get_settings

settings = get_settings()

class LLMService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
    
    def extract_structured_data(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": "You are a precise data extraction assistant. Return only valid JSON with no markdown formatting or additional text."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )
        return response.choices[0].message.content
    
    def generate_summary(self, texts: list[str], context: str = "") -> str:
        combined_text = "\n\n".join(texts)
        
        prompt = f"""
{context}

Based on the following research excerpts, provide a clear, concise summary:

{combined_text[:6000]}

Summary:"""
        
        response = self.client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": "You are a research summarization expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content
    
    def analyze_consensus(self, texts: list[str], topic: str) -> dict:
        combined_text = "\n\n".join(texts)
        
        prompt = f"""
Analyze the following research excerpts about "{topic}" and identify:
1. Areas of consensus (what most papers agree on)
2. Areas of disagreement or contradiction
3. Confidence level (high/medium/low)

Return ONLY valid JSON:
{{
    "consensus_points": ["point1", "point2"],
    "disagreements": ["disagreement1"],
    "confidence": "high|medium|low",
    "summary": "brief summary"
}}

Research excerpts:
{combined_text[:6000]}
"""
        
        response = self.client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": "You are a research analysis expert. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        return response.choices[0].message.content
    
    def identify_gaps(self, texts: list[str], metadata_list: list[dict]) -> dict:
        combined_text = "\n\n".join(texts[:10])
        
        organisms = set()
        years = []
        topics = set()
        
        for meta in metadata_list:
            organisms.update(meta.get('organisms', []))
            if meta.get('year'):
                years.append(meta['year'])
            topics.update(meta.get('keywords', []))
        
        prompt = f"""
Analyze this collection of space biology research and identify knowledge gaps:

Available research covers:
- Organisms: {', '.join(list(organisms)[:10])}
- Years: {min(years) if years else 'unknown'} - {max(years) if years else 'unknown'}
- Topics: {', '.join(list(topics)[:10])}

Sample research:
{combined_text[:4000]}

Identify:
1. Under-researched organisms or conditions
2. Missing experimental approaches
3. Temporal gaps (areas needing more recent research)
4. Critical questions not yet answered

Return ONLY valid JSON:
{{
    "under_researched_areas": ["area1", "area2"],
    "missing_approaches": ["approach1"],
    "temporal_gaps": ["gap1"],
    "critical_questions": ["question1", "question2"]
}}
"""
        
        response = self.client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": "You are a research gap analysis expert. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content
