from fastapi import FastAPI
from app.routers import auth

app = FastAPI(
    title="JARVIS API",
    description="AI-powered developer assistant",
    version="0.1.0"
)

app.include_router(auth.router)

@app.get("/")
def root():
    return {
        "message": "JARVIS is online 🤖",
        "status": "ok",
        "version": "0.1.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}