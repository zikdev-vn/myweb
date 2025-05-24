# routes/contact.py
from fastapi import APIRouter, Request
import httpx
import os

router = APIRouter()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "7318734370:AAGCyDSFwsb4Ln3DHn9y9FnzDfPWiq_1YxA")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "7447164672")

@router.post("/contact")
async def contact(request: Request):
    data = await request.json()
    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    text = f"📩 *Contact Form*\n👤 *Name*: {name}\n📧 *Email*: {email}\n📝 *Message*: {message}"
    
    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
            json={
                "chat_id": CHAT_ID,
                "text": text,
                "parse_mode": "Markdown"
            }
        )

    return {"status": "ok"}
