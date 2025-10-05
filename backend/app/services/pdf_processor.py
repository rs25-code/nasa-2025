import fitz
import json
import os
import re
from typing import Dict, List, Optional
from pathlib import Path
from app.models.schemas import PaperMetadata, ChunkMetadata
from app.services.llm_service import LLMService
from app.config import get_settings

settings = get_settings()

class PDFProcessor:
    def __init__(self):
        self.llm_service = LLMService()
        self.processed_dir = Path("data/processed")
        self.processed_dir.mkdir(parents=True, exist_ok=True)
    
    def extract_text_from_pdf(self, pdf_path: str) -> Dict[str, str]:
        doc = fitz.open(pdf_path)
        
        full_text = []
        sections = {
            "abstract": "",
            "introduction": "",
            "methods": "",
            "results": "",
            "discussion": "",
            "conclusion": ""
        }
        
        current_section = None
        
        for page in doc:
            text = page.get_text()
            full_text.append(text)
            
            text_lower = text.lower()
            
            # Better section detection with word boundaries
            if re.search(r'\babstract\b', text_lower) and not sections["abstract"]:
                current_section = "abstract"
            elif re.search(r'\bintroduction\b', text_lower):
                current_section = "introduction"
            elif re.search(r'\b(method|material|procedure|experimental)\b', text_lower):
                current_section = "methods"
            elif re.search(r'\bresult', text_lower):
                current_section = "results"
            elif re.search(r'\bdiscussion\b', text_lower):
                current_section = "discussion"
            elif re.search(r'\b(conclusion|summary)\b', text_lower):
                current_section = "conclusion"
            
            if current_section and current_section in sections:
                sections[current_section] += text + "\n"
        
        doc.close()
        
        return {
            "full_text": "\n".join(full_text),
            **sections
        }
    
    def extract_metadata_with_llm(self, text_content: Dict[str, str], filename: str) -> PaperMetadata:
        # Use more content for better extraction
        full_text_sample = text_content['full_text'][:12000]
        
        # Include abstract separately if available for better context
        abstract_context = ""
        if text_content.get('abstract'):
            abstract_context = f"\n\nAbstract section:\n{text_content['abstract'][:2000]}"
        
        prompt = f"""
Extract comprehensive metadata from this space biology research paper. Be thorough and specific.

Paper text (first 12000 chars):
{full_text_sample}
{abstract_context}

Extract with high precision:
{{
    "title": "exact full paper title",
    "authors": ["full author names in order"],
    "year": publication_year_as_integer_or_null,
    "abstract": "complete abstract text, or first substantial paragraph if abstract not labeled",
    "organisms": ["specific organisms studied - mice, rats, C. elegans, Arabidopsis, bacteria species, etc."],
    "keywords": ["specific technical terms, phenomena studied, biological processes, experimental conditions"],
    "experiment_type": "detailed description of experimental approach and methodology",
    "space_conditions": ["specific conditions - microgravity, simulated microgravity, radiation exposure type, spaceflight duration, etc."],
    "findings_summary": "3-4 sentence summary of major findings and their implications"
}}

Focus on space biology terms: microgravity, spaceflight, radiation, bone loss, muscle atrophy, gene expression, adaptation, countermeasures, ISS, etc.
Return ONLY valid JSON with no markdown formatting.
"""
        
        response = self.llm_service.extract_structured_data(prompt)
        
        try:
            metadata_dict = json.loads(response)
        except json.JSONDecodeError:
            response_clean = response.strip()
            if response_clean.startswith("```json"):
                response_clean = response_clean[7:]
            if response_clean.startswith("```"):
                response_clean = response_clean[3:]
            if response_clean.endswith("```"):
                response_clean = response_clean[:-3]
            response_clean = response_clean.strip()
            metadata_dict = json.loads(response_clean)
        
        paper_id = Path(filename).stem
        
        return PaperMetadata(
            paper_id=paper_id,
            file_path=filename,
            **metadata_dict
        )
    
    def chunk_paper(self, text_content: Dict[str, str], metadata: PaperMetadata) -> List[ChunkMetadata]:
        chunks = []
        chunk_idx = 0
        
        # Create a rich abstract chunk with more context
        if metadata.abstract and len(metadata.abstract) > 50:
            # Combine abstract with findings for richer semantic content
            abstract_chunk = f"Title: {metadata.title}\n\nAbstract: {metadata.abstract}"
            if metadata.findings_summary:
                abstract_chunk += f"\n\nKey Findings: {metadata.findings_summary}"
            
            chunks.append(ChunkMetadata(
                paper_id=metadata.paper_id,
                chunk_index=chunk_idx,
                chunk_type="abstract",
                text=abstract_chunk,
                metadata={
                    "title": metadata.title,
                    "authors": metadata.authors,
                    "year": metadata.year,
                    "organisms": metadata.organisms,
                    "keywords": metadata.keywords,
                    "section": "abstract",
                    "experiment_type": metadata.experiment_type,
                    "space_conditions": metadata.space_conditions
                }
            ))
            chunk_idx += 1
        
        # Process each section with sentence-aware chunking
        for section_name in ["introduction", "methods", "results", "discussion", "conclusion"]:
            section_text = text_content.get(section_name, "")
            if section_text and len(section_text) > 100:
                # Add section header context to each chunk
                section_header = f"[{section_name.upper()} SECTION from: {metadata.title}]\n\n"
                
                section_chunks = self._split_text_semantically(
                    section_text, 
                    target_size=800,  # Slightly smaller for more focused chunks
                    overlap=150
                )
                
                for i, chunk_text in enumerate(section_chunks):
                    # Add context to each chunk
                    contextual_chunk = section_header + chunk_text
                    
                    chunks.append(ChunkMetadata(
                        paper_id=metadata.paper_id,
                        chunk_index=chunk_idx,
                        chunk_type=section_name,
                        text=contextual_chunk,
                        metadata={
                            "title": metadata.title,
                            "authors": metadata.authors,
                            "year": metadata.year,
                            "organisms": metadata.organisms,
                            "keywords": metadata.keywords,
                            "section": section_name,
                            "section_chunk": i,
                            "experiment_type": metadata.experiment_type,
                            "space_conditions": metadata.space_conditions
                        }
                    ))
                    chunk_idx += 1
        
        return chunks
    
    def _split_text_semantically(self, text: str, target_size: int, overlap: int) -> List[str]:
        """
        Split text at sentence boundaries for better semantic coherence.
        This preserves complete thoughts and improves embedding quality.
        """
        # Split into sentences using multiple delimiters
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        chunks = []
        current_chunk = []
        current_size = 0
        
        for sentence in sentences:
            sentence_words = len(sentence.split())
            
            # If single sentence is too long, split it by words
            if sentence_words > target_size:
                if current_chunk:
                    chunks.append(" ".join(current_chunk))
                    current_chunk = []
                    current_size = 0
                
                # Split long sentence by words
                words = sentence.split()
                for i in range(0, len(words), target_size - overlap):
                    chunk = " ".join(words[i:i + target_size])
                    if chunk:
                        chunks.append(chunk)
                continue
            
            # Add sentence to current chunk
            if current_size + sentence_words <= target_size:
                current_chunk.append(sentence)
                current_size += sentence_words
            else:
                # Start new chunk
                if current_chunk:
                    chunks.append(" ".join(current_chunk))
                
                # Keep last few sentences for overlap (semantic continuity)
                overlap_sentences = []
                overlap_size = 0
                for s in reversed(current_chunk):
                    s_words = len(s.split())
                    if overlap_size + s_words <= overlap:
                        overlap_sentences.insert(0, s)
                        overlap_size += s_words
                    else:
                        break
                
                current_chunk = overlap_sentences + [sentence]
                current_size = overlap_size + sentence_words
        
        # Add remaining chunk
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks
    
    def process_pdf(self, pdf_path: str) -> tuple[PaperMetadata, List[ChunkMetadata]]:
        filename = os.path.basename(pdf_path)
        paper_id = Path(filename).stem
        
        cache_file = self.processed_dir / f"{paper_id}.json"
        if cache_file.exists():
            with open(cache_file, 'r') as f:
                cached = json.load(f)
                metadata = PaperMetadata(**cached['metadata'])
                chunks = [ChunkMetadata(**c) for c in cached['chunks']]
                return metadata, chunks
        
        text_content = self.extract_text_from_pdf(pdf_path)
        metadata = self.extract_metadata_with_llm(text_content, filename)
        chunks = self.chunk_paper(text_content, metadata)
        
        with open(cache_file, 'w') as f:
            json.dump({
                'metadata': metadata.model_dump(),
                'chunks': [c.model_dump() for c in chunks]
            }, f, indent=2)
        
        return metadata, chunks
    
    def process_all_pdfs(self, pdf_directory: str) -> List[tuple[PaperMetadata, List[ChunkMetadata]]]:
        pdf_dir = Path(pdf_directory)
        pdf_files = list(pdf_dir.glob("*.pdf"))
        
        results = []
        for pdf_file in pdf_files:
            try:
                print(f"Processing {pdf_file.name}...")
                metadata, chunks = self.process_pdf(str(pdf_file))
                results.append((metadata, chunks))
                print(f"✓ Processed {pdf_file.name}: {len(chunks)} chunks")
            except Exception as e:
                print(f"✗ Failed to process {pdf_file.name}: {str(e)}")
        
        return results
