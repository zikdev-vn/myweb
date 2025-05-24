from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from models.product_models import Product, SessionLocal
from datetime import datetime
import gui.gui_import as gui  
import requests
from fastapi.middleware.cors import CORSMiddleware
from flask import Flask, request, jsonify
# Cho phép frontend truy cập API
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép React truy cập
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    
)
# Phục vụ ảnh tĩnh từ thư mục images/
app.mount("/images", StaticFiles(directory="images"), name="images")

# key check turnstile

TURNSTILE_SECRET_KEY = "0x4AAAAAABdwuSjyv9LDdrOt9UtGD4AQjek"

class TurnstileRequest(BaseModel):
    token: str


# Lấy sản phẩm từ CSDL
@app.get("/product/{product_id}")
async def get_product(product_id: str):
    session: Session = SessionLocal()

    product = session.query(Product).filter(Product.id == product_id).first()
    session.close()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Trả về dữ liệu đầy đủ
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "discount": product.discount,
        "stock": product.stock,
        "category": product.category,
        "image1": product.image1,  # VD: /images/abc123.png
        "image2": product.image2,
        "is_featured": product.is_featured,
        "created_at": product.created_at.isoformat(),
        "updated_at": product.updated_at.isoformat()
    }
@app.get("/products")
def get_products():
    db = SessionLocal()
    products = db.query(Product).all()
    db.close()
    return products

@app.post("/verify-turnstile")
def verify_turnstile(data: TurnstileRequest):
    token = data.token

    if not token:
        return {"success": False, "message": "Thiếu token"}

    verify_url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    payload = {
        "secret": TURNSTILE_SECRET_KEY,
        "response": token
    }

    try:
        response = requests.post(verify_url, data=payload)
        result = response.json()
        if result.get("success"):
            return {"success": True}
        else:
            return {"success": False, "message": "Token không hợp lệ", "data": result}
    except Exception as e:
        return {"success": False, "message": "Lỗi hệ thống", "error": str(e)}