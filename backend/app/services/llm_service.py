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
                {"role": "system", "content": "You are a precise scientific data extraction assistant specializing in space biology research. Return only valid JSON with no markdown formatting or additional text. Focus on accuracy and completeness."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )
        return response.choices[0].message.content
    
    def generate_summary(self, texts: list[str], context: str = "") -> dict:
        """Generate persona-specific summaries with high technical quality."""
        combined_text = "\n\n---\n\n".join(texts[:8])  # Use top 8 for quality
        
        # Enhanced persona-specific prompts
        persona_prompts = {
            "scientist": """You are summarizing space biology research for a scientific researcher.

CRITICAL REQUIREMENTS:
- Use precise technical terminology and scientific language
- Cite specific methodologies, experimental designs, and statistical approaches
- Highlight contradictions or variations in findings across studies
- Include quantitative data and effect sizes when available
- Identify gaps in methodology or areas needing replication
- Discuss mechanisms and biological pathways
- Reference specific organisms, genes, proteins, or biomarkers studied

Research excerpts:
{text}

Provide a structured summary that a scientist would find valuable for their research. Return ONLY valid JSON:
{{
    "summary": "3-4 detailed paragraphs covering: (1) key methodologies and experimental approaches, (2) major findings with quantitative details, (3) mechanisms and biological implications, (4) contradictions or areas of uncertainty",
    "key_points": [
        "Specific methodology: technique, sample size, conditions",
        "Quantitative finding with statistical significance",
        "Biological mechanism or pathway identified",
        "Limitation or contradiction in current evidence",
        "Gap or opportunity for future research"
    ]
}}""",
            
            "investor": """You are analyzing space biology research for an investment manager evaluating commercial opportunities.

CRITICAL REQUIREMENTS:
- Focus on commercial potential and market applications
- Identify technology readiness levels and development timelines
- Highlight terrestrial applications and dual-use technologies
- Assess scalability and manufacturing potential
- Identify intellectual property and competitive advantages
- Consider regulatory pathways and market size
- Quantify potential ROI indicators where possible

Research excerpts:
{text}

Provide an investment-focused analysis. Return ONLY valid JSON:
{{
    "summary": "3-4 paragraphs covering: (1) commercial technologies and applications emerging from this research, (2) market potential and addressable markets (space and terrestrial), (3) development stage and investment requirements, (4) competitive landscape and differentiation",
    "key_points": [
        "Commercial technology with specific application",
        "Market size or growth opportunity",
        "Technology readiness level and timeline to market",
        "Terrestrial application with revenue potential",
        "Competitive advantage or IP protection opportunity"
    ]
}}""",
            
            "architect": """You are analyzing space biology research for a mission architect planning human spaceflight missions.

CRITICAL REQUIREMENTS:
- Focus on mission-critical constraints and requirements
- Identify physiological risks and countermeasure effectiveness
- Assess life support system requirements
- Quantify acceptable risk levels and safety margins
- Evaluate crew health monitoring needs
- Consider mission duration impacts (short vs. long-duration)
- Prioritize systems integration and operational constraints

Research excerpts:
{text}

Provide a mission architecture analysis. Return ONLY valid JSON:
{{
    "summary": "3-4 paragraphs covering: (1) critical physiological risks and constraints for human spaceflight, (2) countermeasure effectiveness and implementation requirements, (3) life support and medical systems needed, (4) gaps that pose mission risks",
    "key_points": [
        "Specific physiological risk with quantified impact",
        "Effective countermeasure with implementation details",
        "Life support requirement with mass/power/volume budget",
        "Monitoring system or diagnostic need",
        "Critical gap that could jeopardize mission safety"
    ]
}}"""
        }
        
        # Select appropriate prompt based on context
        if "scientist" in context.lower():
            prompt_template = persona_prompts["scientist"]
        elif "investor" in context.lower():
            prompt_template = persona_prompts["investor"]
        elif "architect" in context.lower():
            prompt_template = persona_prompts["architect"]
        else:
            prompt_template = persona_prompts["scientist"]
        
        prompt = prompt_template.format(text=combined_text)
        
        response = self.client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": "You are an expert space biology analyst. Return only valid JSON with no markdown formatting."},
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
    
    def analyze_consensus(self, texts: list[str], topic: str) -> str:
        """Analyze consensus and disagreements across studies."""
        combined_text = "\n\n---\n\n".join(texts[:10])
        
        prompt = f"""Analyze these space biology research excerpts about "{topic}" to identify scientific consensus and disagreements.

ANALYSIS REQUIREMENTS:
- Identify points where multiple studies agree (consensus)
- Identify contradictions or conflicting findings
- Note methodological differences that might explain disagreements
- Assess the strength of evidence for each point
- Consider sample sizes, experimental conditions, and organism differences

Research excerpts:
{combined_text}

Provide a thorough consensus analysis. Return ONLY valid JSON:
{{
    "consensus_points": [
        "Clear statement of agreed-upon finding with supporting evidence strength",
        "Another consensus point with methodological consistency noted"
    ],
    "disagreements": [
        "Specific contradiction between studies with possible explanations",
        "Another area of disagreement with methodological context"
    ],
    "confidence": "high|medium|low - based on number of studies, consistency, and methodological rigor",
    "summary": "2-3 sentence overview of the current state of knowledge and key uncertainties"
}}

Include at least 3-5 consensus points and 2-3 disagreements if present.
"""
        
        response = self.client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": "You are a research analysis expert specializing in systematic reviews. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        return response.choices[0].message.content
    
    def identify_gaps(self, texts: list[str], metadata_list: list[dict]) -> str:
        """Identify research gaps and opportunities."""
        combined_text = "\n\n---\n\n".join(texts[:15])
        
        # Extract comprehensive metadata
        organisms = set()
        years = []
        topics = set()
        experiment_types = set()
        space_conditions = set()
        
        for meta in metadata_list:
            if meta.get('organisms'):
                organisms.update(meta.get('organisms', []))
            if meta.get('year'):
                years.append(meta['year'])
            if meta.get('keywords'):
                topics.update(meta.get('keywords', []))
            if meta.get('experiment_type'):
                experiment_types.add(meta.get('experiment_type', ''))
            if meta.get('space_conditions'):
                space_conditions.update(meta.get('space_conditions', []))
        
        # Build context about research coverage
        coverage_context = f"""
CURRENT RESEARCH COVERAGE:
- Organisms studied: {', '.join(list(organisms)[:15])}
- Time span: {min(years) if years else 'unknown'} - {max(years) if years else 'unknown'}
- Key topics: {', '.join(list(topics)[:20])}
- Experimental approaches: {', '.join(list(experiment_types)[:10])}
- Conditions studied: {', '.join(list(space_conditions)[:10])}
"""
        
        prompt = f"""Identify critical research gaps in space biology based on this analysis of the literature.

{coverage_context}

Sample research content:
{combined_text}

GAP ANALYSIS REQUIREMENTS:
- Identify under-studied organisms or life stages (e.g., missing model organisms, developmental stages)
- Note experimental approaches not yet applied (e.g., omics techniques, long-duration studies)
- Highlight biological systems lacking data (e.g., organ systems, molecular pathways)
- Identify missing condition combinations (e.g., radiation + microgravity)
- Suggest high-priority questions based on mission needs
- Focus on actionable research directions

Return ONLY valid JSON:
{{
    "under_researched_areas": [
        "Specific organism/system gap with scientific rationale",
        "Another under-studied area with mission relevance"
    ],
    "missing_approaches": [
        "Methodological gap with potential impact",
        "Another missing experimental approach"
    ],
    "critical_questions": [
        "High-priority research question for long-duration missions",
        "Another critical unanswered question"
    ],
    "recommendations": [
        "Specific actionable research recommendation with expected outcome",
        "Another high-impact research direction"
    ]
}}

Provide at least 4-5 items in each category with specific, actionable details.
"""
        
        response = self.client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": "You are a research gap analysis expert for space biology. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content
