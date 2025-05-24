# routes/register.py
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import User
from app.database import SessionLocal
import redis.asyncio as redis
from fastapi_limiter.depends import RateLimiter
from fastapi_limiter import FastAPILimiter
router = APIRouter()

# Schema cho dữ liệu gửi lên
class RegisterRequest(BaseModel):
    name: str
    password: str
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoint đăng ký
@router.post("/register", dependencies=[Depends(RateLimiter(times=5, seconds=86400))])
async def register(request: Request, form: RegisterRequest, db: Session = Depends(get_db)):
    
    # Lấy IP + User-Agent nếu cần lưu hoặc xử lý thêm
    ip = request.client.host or "unknown-ip"
    user_agent = request.headers.get("User-Agent", "unknown-ua")

    if db.query(User).filter_by(name=form.name).first():
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(name=form.name)
    user.set_password(form.password)
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "msg": "Registered successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "created_at": user.created_at.isoformat(),
            "updated_at": user.updated_at.isoformat()
        }
    }
