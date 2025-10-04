from openai import OpenAI
from app.config import get_settings
import json

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
    
    def generate_summary(self, texts: list[str], context: str = "") -> dict:
        combined_text = "\n\n".join(texts)
        
        prompt = f"""
{context}

Based on the following research excerpts, provide a structured summary.

Return ONLY valid JSON with no markdown formatting:
{{
    "summary": "2-3 paragraph summary of the research",
    "key_points": ["key point 1", "key point 2", "key point 3", "key point 4", "key point 5"]
}}

Research excerpts:
{combined_text[:6000]}
"""
        
        response = self.client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": "You are a research summarization expert. Return only valid JSON with no markdown formatting."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        result = response.choices[0].message.content
        
        # Parse JSON response
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            # Clean markdown if present
            result_clean = result.strip()
            if result_clean.startswith("```json"):
                result_clean = result_clean[7:]
            if result_clean.startswith("```"):
                result_clean = result_clean[3:]
            if result_clean.endswith("```"):
                result_clean = result_clean[:-3]
            result_clean = result_clean.strip()
            return json.loads(result_clean)
    
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
3. Critical questions not yet answered
4. Recommendations for future research

Return ONLY valid JSON:
{{
    "under_researched_areas": ["area1", "area2"],
    "missing_approaches": ["approach1"],
    "critical_questions": ["question1", "question2"],
    "recommendations": ["recommendation1", "recommendation2"]
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
