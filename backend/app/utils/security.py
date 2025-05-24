from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests

router = APIRouter()

TURNSTILE_SECRET_KEY = "0x4AAAAAABdwuSjyv9LDdrOt9UtGD4AQjek"
VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

class TurnstileToken(BaseModel):
    token: str

@router.post("/verify-turnstile")
def verify_turnstile(data: TurnstileToken):
    if not data.token:
        raise HTTPException(status_code=400, detail="Thiếu token")

    payload = {
        "secret": TURNSTILE_SECRET_KEY,
        "response": data.token
    }

    try:
        response = requests.post(VERIFY_URL, data=payload)
        result = response.json()

        if result.get("success"):
            return {"success": True}
        else:
            raise HTTPException(
                status_code=400,
                detail={"success": False, "message": "Token không hợp lệ", "data": result}
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "message": "Lỗi hệ thống", "error": str(e)})
