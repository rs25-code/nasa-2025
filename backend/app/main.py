from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Space Biology Knowledge Engine API",
    description="API for NASA Space Biology Research Knowledge Base",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["research"])

@app.get("/")
async def root():
    return {
        "message": "Space Biology Knowledge Engine API",
        "version": "1.0.0",
        "endpoints": {
            "search": "/api/search",
            "summarize": "/api/summarize",
            "consensus": "/api/consensus",
            "gaps": "/api/gaps",
            "trends": "/api/trends",
            "filters": "/api/filters",
            "stats": "/api/stats"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
