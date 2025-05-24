from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.base import Base
from werkzeug.security import generate_password_hash, check_password_hash
from app.database import get_db
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship


import uuid
def generate_secure_id():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "user"

    id = Column(String, primary_key=True, default=generate_secure_id)
    name = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_time = Column(DateTime, nullable=True)
    last_login_ip = Column(String(45), nullable=True)
    transactions = relationship("TransactionHistory", back_populates="user")
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class TransactionHistory(Base):
    __tablename__ = "transaction_history"

    id = Column(Integer, primary_key=True, index=True) # Added index for faster lookups
    user_id = Column(String, ForeignKey("user.id"), nullable=False) # Changed to String to match User.id type
    order_id = Column(String(100), index=True) # Added index
    request_id = Column(String(100))
    amount = Column(Integer)
    status = Column(String(50)) # e.g., "SUCCESS", "FAILED", "PENDING", "ERROR"
    message = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")

    def __repr__(self):
        return f"<TransactionHistory {self.order_id} - {self.status}>"
class Product(Base):
    __tablename__ = "product"

    id = Column(Integer, primary_key=True)
    name = Column(String(120), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    stock = Column(Integer, default=0)
    category = Column(String(100))
    image1 = Column(String(255))
    image2 = Column(String(255))
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Product {self.name}>'

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "discount": self.discount,
            "stock": self.stock,
            "category": self.category,
            "image1": self.image1,
            "image2": self.image2,
            "is_featured": self.is_featured,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
