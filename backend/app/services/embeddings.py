from openai import OpenAI
from typing import List
from app.config import get_settings

settings = get_settings()

class EmbeddingService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
    
    def generate_embedding(self, text: str) -> List[float]:
        text = text.replace("\n", " ").strip()
        
        if not text:
            return [0.0] * settings.embedding_dimensions
        
        response = self.client.embeddings.create(
            input=text,
            model=settings.embedding_model
        )
        return response.data[0].embedding
    
    def generate_embeddings_batch(self, texts: List[str], batch_size: int = 100) -> List[List[float]]:
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_clean = [text.replace("\n", " ").strip() for text in batch]
            
            response = self.client.embeddings.create(
                input=batch_clean,
                model=settings.embedding_model
            )
            
            batch_embeddings = [item.embedding for item in response.data]
            embeddings.extend(batch_embeddings)
        
        return embeddings
