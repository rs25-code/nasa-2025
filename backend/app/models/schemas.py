from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class PaperMetadata(BaseModel):
    paper_id: str
    title: str
    authors: List[str]
    year: Optional[int]
    abstract: str
    organisms: List[str]
    keywords: List[str]
    experiment_type: str
    space_conditions: List[str]
    findings_summary: str
    file_path: str

class ChunkMetadata(BaseModel):
    paper_id: str
    chunk_index: int
    chunk_type: str
    text: str
    metadata: Dict[str, Any]

class SearchQuery(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None
    top_k: int = 10
    persona: Optional[str] = None

class SearchResult(BaseModel):
    paper_id: str
    title: str
    score: float
    text: str
    metadata: Dict[str, Any]
    
class ProcessingStatus(BaseModel):
    total_papers: int
    processed_papers: int
    failed_papers: List[str]
    status: str
