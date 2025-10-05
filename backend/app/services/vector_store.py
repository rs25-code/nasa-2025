from pinecone import Pinecone, ServerlessSpec
from typing import List, Dict, Any, Optional
from app.models.schemas import ChunkMetadata, PaperMetadata
from app.services.embeddings import EmbeddingService
from app.config import get_settings
import time

settings = get_settings()

class VectorStore:
    def __init__(self):
        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        self.embedding_service = EmbeddingService()
        self.index_name = settings.pinecone_index_name
        self.index = None
        
    def initialize_index(self):
        existing_indexes = [index.name for index in self.pc.list_indexes()]
        
        if self.index_name not in existing_indexes:
            self.pc.create_index(
                name=self.index_name,
                dimension=settings.embedding_dimensions,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region=settings.pinecone_environment
                )
            )
            
            while not self.pc.describe_index(self.index_name).status['ready']:
                time.sleep(1)
        
        self.index = self.pc.Index(self.index_name)
    
    def upsert_chunks(self, chunks: List[ChunkMetadata], batch_size: int = 100):
        if not self.index:
            self.initialize_index()
        
        texts = [chunk.text for chunk in chunks]
        embeddings = self.embedding_service.generate_embeddings_batch(texts, batch_size)
        
        vectors = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            vector_id = f"{chunk.paper_id}_chunk_{chunk.chunk_index}"
            
            metadata = chunk.metadata.copy()
            metadata.update({
                "paper_id": chunk.paper_id,
                "chunk_type": chunk.chunk_type,
                "chunk_index": chunk.chunk_index,
                "text": chunk.text[:2000]
            })
            
            vectors.append({
                "id": vector_id,
                "values": embedding,
                "metadata": metadata
            })
        
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i + batch_size]
            self.index.upsert(vectors=batch)
        
        print(f"Upserted {len(vectors)} vectors to Pinecone")
    
    def upsert_papers(self, papers_data: List[tuple[PaperMetadata, List[ChunkMetadata]]]):
        if not self.index:
            self.initialize_index()
        
        for metadata, chunks in papers_data:
            print(f"Uploading {metadata.file_path}...")
            self.upsert_chunks(chunks)
    
    def search(
        self, 
        query: str, 
        top_k: int = 10,
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        if not self.index:
            self.initialize_index()
        
        query_embedding = self.embedding_service.generate_embedding(query)
        fetch_k = min(top_k * 2, 100)
        
        results = self.index.query(
            vector=query_embedding,
            top_k=fetch_k,
            include_metadata=True,
            filter=filter_dict
        )
        
        MIN_SCORE_THRESHOLD = 0.35
        
        filtered_results = [
            {
                "id": match.id,
                "score": match.score,
                "metadata": match.metadata
            }
            for match in results.matches
            if match.score >= MIN_SCORE_THRESHOLD
        ]
        
        return filtered_results[:top_k]
    
    def search_with_reranking(
        self,
        query: str,
        top_k: int = 10,
        filter_dict: Optional[Dict[str, Any]] = None,
        boost_sections: List[str] = None
    ) -> List[Dict[str, Any]]:
        if not self.index:
            self.initialize_index()
        
        query_embedding = self.embedding_service.generate_embedding(query)
        fetch_k = min(top_k * 3, 150)
        
        results = self.index.query(
            vector=query_embedding,
            top_k=fetch_k,
            include_metadata=True,
            filter=filter_dict
        )
        
        reranked_results = []
        for match in results.matches:
            score = match.score
            metadata = match.metadata
            
            if boost_sections and metadata.get("section") in boost_sections:
                score *= 1.15
            
            year = metadata.get("year")
            if year and year >= 2020:
                score *= 1.05
            
            reranked_results.append({
                "id": match.id,
                "score": score,
                "metadata": metadata
            })
        
        MIN_SCORE_THRESHOLD = 0.35
        filtered_results = [
            r for r in reranked_results 
            if r["score"] >= MIN_SCORE_THRESHOLD
        ]
        
        filtered_results.sort(key=lambda x: x["score"], reverse=True)
        
        return filtered_results[:top_k]
    
    def get_all_metadata(self) -> Dict[str, Any]:
        if not self.index:
            self.initialize_index()
    
        stats = self.index.describe_index_stats()
        return stats
    
    def get_all_papers_metadata(self, max_fetch: int = 200) -> List[Dict[str, Any]]:
        """Fetch metadata for all papers without score filtering"""
        if not self.index:
            self.initialize_index()
        
        query_embedding = self.embedding_service.generate_embedding("research")
        
        results = self.index.query(
            vector=query_embedding,
            top_k=max_fetch,
            include_metadata=True
        )
        
        return [
            {
                "id": match.id,
                "score": match.score,
                "metadata": match.metadata
            }
            for match in results.matches
        ]
