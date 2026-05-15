from fastapi import FastAPI

app = FastAPI(
    title="JARVIS API",
    description="AI-powered developer assistant",
    version="0.1.0"
)

@app.get("/")
def root():
    return {
        "message": "JARVIS is online",
        "status": "ok",
        "version": "0.1.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}