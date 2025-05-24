# routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi_jwt_auth import AuthJWT
from datetime import datetime
from app.models import User, get_db
import requests

router = APIRouter()
GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"

# ----------- Schemas -----------
class LoginRequest(BaseModel):
    name: str
    password: str

class GoogleLoginRequest(BaseModel):
    token: str

# ----------- JWT Config (phải cấu hình riêng) -----------
class Settings(BaseModel):
    authjwt_secret_key: str = "Zikdev21122004@Admin123"

@AuthJWT.load_config
def get_config():
    return Settings()

# ----------- Routes -----------

def get_optional_user(
    Authorize: AuthJWT = Depends(),
    db: Session = Depends(get_db)
) -> User | None:
    try:
        Authorize.jwt_optional()  # ✅ Đúng cú pháp với version mới
        user_id = Authorize.get_jwt_subject()
        if user_id:
            return db.query(User).filter(User.id == user_id).first()
    except Exception as e:
        print("❌ Token lỗi:", str(e))
    return None
@router.post("/login")
def login(form: LoginRequest, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    user = db.query(User).filter_by(name=form.name).first()
    if not user or not user.check_password(form.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user.last_login_time = datetime.utcnow()
    user.last_login_ip = "client-ip-from-request"  # có thể lấy từ `Request.client.host` nếu cần
    db.commit()

    access_token = Authorize.create_access_token(subject=str(user.id))
    return {
        "access_token": access_token,
        "last_login_time": user.last_login_time.isoformat(),
        "last_login_ip": user.last_login_ip
    }
@router.get("/whoami")
def whoami(Authorize: AuthJWT = Depends(), db: Session = Depends(get_db)):
    Authorize.jwt_required()
    user_id = Authorize.get_jwt_subject()

    user = db.query(User).get(user_id)  # <--- Sửa chỗ này, không ép int()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "created_at": user.created_at.isoformat(),
        "updated_at": user.updated_at.isoformat()
    }
@router.post("/google-login")
def google_login(data: GoogleLoginRequest, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    if not data.token:
        raise HTTPException(status_code=400, detail="Thiếu token")

    response = requests.get(GOOGLE_TOKEN_INFO_URL, params={"id_token": data.token})
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    user_info = response.json()
    email = user_info.get("email")
    name = user_info.get("name")

    user = db.query(User).filter_by(name=email).first()
    if not user:
        user = User(
            name=email,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        user.set_password("")  # hoặc "google"
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = Authorize.create_access_token(subject=str(user.id))
    return {
        "access_token": access_token,
        "id": user.id,
        "name": name,
        "email": email
    }


import os
import time
import jwt
# Lấy các biến môi trường
PROJECT_ID = os.getenv("STRINGEE_PROJECT_ID", "2283400") # ID dự án Stringee của bạn
KEY_SID = os.getenv("STRINGEE_KEY_SID", "SK.0.6bMsuhCe4p3YfR2buHDBapvYItDax8bi") # Key SID của bạn
KEY_SECRET = os.getenv("STRINGEE_KEY_SECRET", "WVRXMElHMGNUeUc1UGtEaEtEdHNsemp6cVdpeVRjUE0=") # Secret Key của bạn

@router.post("/stringee/token")
def generate_stringee_token(
    Authorize: AuthJWT = Depends(), # Dùng FastAPI-JWT-Auth để xác thực JWT của bạn
    db: Session = Depends(get_db) # Dùng SQLAlchemy để truy vấn database
):
    """
    Tạo Stringee Access Token cho người dùng đã xác thực.
    """
    Authorize.jwt_required() # Yêu cầu JWT hợp lệ

    # Lấy ID người dùng từ JWT subject
    user_id = Authorize.get_jwt_subject()
    user = db.query(User).filter_by(id=user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = int(time.time()) # Thời gian hiện tại (Unix timestamp)
    exp = now + 3600       # Token có hiệu lực trong 1 giờ (3600 giây)

    payload = {
        "jti": f"{user.id}-{now}", # JWT ID duy nhất
        "iss": KEY_SID,            # Issuer (Key SID)
        "exp": exp,                # Thời gian hết hạn
        "userId": str(user.id)     # ID người dùng Stringee (phải là chuỗi)
    }

    # Mã hóa payload để tạo Stringee Token bằng Secret Key của bạn
    stringee_token = jwt.encode(payload, KEY_SECRET, algorithm="HS256")

    return {"stringee_access_token": stringee_token}
