from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import Message, Conversation
from app.auth import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/chat", tags=["Chat"])
security = HTTPBearer()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

JARVIS_SYSTEM_PROMPT = """You are JARVIS — an elite AI developer assistant.
You are precise, concise, and deeply technical.
When writing code, always explain what each part does.
When you spot bugs or security issues, mention them proactively.
You speak like a senior developer mentoring a junior —
firm, clear, supportive, never condescending.
Format code blocks properly. Be direct. Never waffle."""

class ChatRequest(BaseModel):
    message: str
    conversation_id: int | None = None

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return int(payload["sub"])

@router.post("")
async def chat(
    request: ChatRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get or create conversation
    if request.conversation_id:
        conv = db.query(Conversation).filter(
            Conversation.id == request.conversation_id,
            Conversation.user_id == user_id
        ).first()
    else:
        conv = Conversation(
            user_id=user_id,
            title=request.message[:50]
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Save user message
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=request.message
    )
    db.add(user_msg)
    db.commit()

    # Get conversation history
    history = db.query(Message).filter(
        Message.conversation_id == conv.id
    ).order_by(Message.created_at).all()

    messages = [
        {"role": m.role, "content": m.content}
        for m in history
    ]

    full_response = []

    def stream_response():
        stream = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": JARVIS_SYSTEM_PROMPT}
            ] + messages,
            stream=True,
            max_tokens=2048
        )
        for chunk in stream:
            text = chunk.choices[0].delta.content or ""
            if text:
                full_response.append(text)
                yield text

        # Save AI response to database
        ai_msg = Message(
            conversation_id=conv.id,
            role="assistant",
            content="".join(full_response)
        )
        db.add(ai_msg)
        db.commit()

    return StreamingResponse(
        stream_response(),
        media_type="text/plain",
        headers={"X-Conversation-Id": str(conv.id)}
    )