# app/routes/product/product.py

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.models import Product
from app.database import get_db
import os
from fastapi.staticfiles import StaticFiles
router = APIRouter()

# Serve static image files from /images


# Lấy 1 sản phẩm theo ID
@router.get("/product/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "discount": product.discount,
        "stock": product.stock,
        "category": product.category,
        "image1": f"/{product.image1}",
        "image2": f"/{product.image2}",
        "is_featured": product.is_featured,
        "created_at": product.created_at.isoformat(),
        "updated_at": product.updated_at.isoformat()
    }

# Lấy danh sách tất cả sản phẩm
@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "discount": p.discount,
            "stock": p.stock,
            "category": p.category,
            "image1": f"/images/{p.image1}",
            "image2": f"/images/{p.image2}",
            "is_featured": p.is_featured,
            "created_at": p.created_at.isoformat(),
            "updated_at": p.updated_at.isoformat()
        }
        for p in products
    ]
