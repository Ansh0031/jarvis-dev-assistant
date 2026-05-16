from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.user import User
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# --- Schemas (what data we expect) ---
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_name: str

# --- Register endpoint ---
@router.post("/register", status_code=201)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    # Create new user with hashed password
    new_user = User(
        name=request.name,
        email=request.email,
        password=hash_password(request.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "message": "Account created successfully",
        "user_id": new_user.id,
        "name": new_user.name
    }

# --- Login endpoint ---
@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    # Verify password
    if not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    # Create JWT token
    token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_name": user.name
    }