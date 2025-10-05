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
                # Store more text for better context (increased from 1000 to 2000)
                "text": chunk.text[:2000]  # Doubled text storage for richer context
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
        """
        Search with improved parameters for better relevance.
        """
        if not self.index:
            self.initialize_index()
        
        # Generate embedding for the query
        query_embedding = self.embedding_service.generate_embedding(query)
        
        # Search with larger initial set for better filtering
        # Fetch 2x the requested results to allow for better filtering/ranking
        fetch_k = min(top_k * 2, 100)
        
        results = self.index.query(
            vector=query_embedding,
            top_k=fetch_k,
            include_metadata=True,
            filter=filter_dict
        )
        
        # Apply relevance threshold and return top_k
        # This filters out low-quality matches
        MIN_SCORE_THRESHOLD = 0.55  # Adjust based on your needs
        
        filtered_results = [
            {
                "id": match.id,
                "score": match.score,
                "metadata": match.metadata
            }
            for match in results.matches
            if match.score >= MIN_SCORE_THRESHOLD
        ]
        
        # Return only top_k after filtering
        return filtered_results[:top_k]
    
    def search_with_reranking(
        self,
        query: str,
        top_k: int = 10,
        filter_dict: Optional[Dict[str, Any]] = None,
        boost_sections: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Advanced search with section-based reranking for better results.
        
        Args:
            query: Search query
            top_k: Number of results to return
            filter_dict: Pinecone filter dictionary
            boost_sections: Sections to boost (e.g., ["abstract", "results"])
        """
        if not self.index:
            self.initialize_index()
        
        # Fetch more results initially
        query_embedding = self.embedding_service.generate_embedding(query)
        fetch_k = min(top_k * 3, 150)
        
        results = self.index.query(
            vector=query_embedding,
            top_k=fetch_k,
            include_metadata=True,
            filter=filter_dict
        )
        
        # Rerank based on section relevance
        reranked_results = []
        for match in results.matches:
            score = match.score
            metadata = match.metadata
            
            # Boost abstract and results sections as they typically have key findings
            if boost_sections and metadata.get("section") in boost_sections:
                score *= 1.15  # 15% boost for priority sections
            
            # Boost recent papers (more relevant for trends)
            year = metadata.get("year")
            if year and year >= 2020:
                score *= 1.05  # 5% boost for recent research
            
            reranked_results.append({
                "id": match.id,
                "score": score,
                "metadata": metadata
            })
        
        # Sort by reranked scores and apply threshold
        MIN_SCORE_THRESHOLD = 0.55
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
        print("Raw Pinecone stats:", stats)  # DEBUG
        return stats
