from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    openai_api_key: str
    pinecone_api_key: str
    pinecone_environment: str
    pinecone_index_name: str
    
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    llm_model: str = "gpt-4o"
    
    # Improved chunking parameters for better semantic coherence
    chunk_size: int = 800  # Reduced from 1000 for more focused chunks
    chunk_overlap: int = 150  # Reduced from 200 for better balance
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
