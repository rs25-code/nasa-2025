import fitz
import json
import os
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
            if "abstract" in text_lower and not sections["abstract"]:
                current_section = "abstract"
            elif "introduction" in text_lower:
                current_section = "introduction"
            elif "method" in text_lower or "material" in text_lower:
                current_section = "methods"
            elif "result" in text_lower:
                current_section = "results"
            elif "discussion" in text_lower:
                current_section = "discussion"
            elif "conclusion" in text_lower:
                current_section = "conclusion"
            
            if current_section and current_section in sections:
                sections[current_section] += text + "\n"
        
        doc.close()
        
        return {
            "full_text": "\n".join(full_text),
            **sections
        }
    
    def extract_metadata_with_llm(self, text_content: Dict[str, str], filename: str) -> PaperMetadata:
        prompt = f"""
Extract metadata from this research paper. Return ONLY valid JSON with no markdown formatting.

Paper text (first 8000 chars):
{text_content['full_text'][:8000]}

Extract:
{{
    "title": "exact paper title",
    "authors": ["list", "of", "authors"],
    "year": publication_year_as_int_or_null,
    "abstract": "the abstract text",
    "organisms": ["list of organisms studied, e.g., mice, plants, bacteria"],
    "keywords": ["key", "research", "topics"],
    "experiment_type": "brief description of experiment type",
    "space_conditions": ["conditions like microgravity, radiation, etc."],
    "findings_summary": "2-3 sentence summary of key findings"
}}
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
        
        if metadata.abstract:
            chunks.append(ChunkMetadata(
                paper_id=metadata.paper_id,
                chunk_index=chunk_idx,
                chunk_type="abstract",
                text=metadata.abstract,
                metadata={
                    "title": metadata.title,
                    "authors": metadata.authors,
                    "year": metadata.year,
                    "organisms": metadata.organisms,
                    "section": "abstract"
                }
            ))
            chunk_idx += 1
        
        for section_name in ["introduction", "methods", "results", "discussion", "conclusion"]:
            section_text = text_content.get(section_name, "")
            if section_text and len(section_text) > 100:
                section_chunks = self._split_text(section_text, settings.chunk_size, settings.chunk_overlap)
                
                for i, chunk_text in enumerate(section_chunks):
                    chunks.append(ChunkMetadata(
                        paper_id=metadata.paper_id,
                        chunk_index=chunk_idx,
                        chunk_type=section_name,
                        text=chunk_text,
                        metadata={
                            "title": metadata.title,
                            "authors": metadata.authors,
                            "year": metadata.year,
                            "organisms": metadata.organisms,
                            "section": section_name,
                            "section_chunk": i
                        }
                    ))
                    chunk_idx += 1
        
        return chunks
    
    def _split_text(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk:
                chunks.append(chunk)
        
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
