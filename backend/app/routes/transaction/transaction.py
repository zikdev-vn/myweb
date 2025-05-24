from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import TransactionHistory, get_db, User
from app.routes.Login.login import get_optional_user

from fastapi import Query


router = APIRouter()

@router.get("/my-transactions")
def get_my_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Bạn cần đăng nhập để xem lịch sử giao dịch")
    print(f"DEBUG current_user.id: {current_user.id}")
    transactions = db.query(TransactionHistory).filter(TransactionHistory.user_id == current_user.id).all()
    print(f"DEBUG transactions found: {len(transactions)}")
    transactions = (
        db.query(TransactionHistory)
        .filter(TransactionHistory.user_id == current_user.id)
        .order_by(TransactionHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
    "total": len(transactions),
    "data": [
        {
            "id": tx.id,
            "order_id": tx.order_id,
            "request_id": tx.request_id,
            "amount": tx.amount,
            "status": tx.status,
            "message": tx.message,
            "created_at": tx.created_at.isoformat()
        }
        for tx in transactions
    ]
}
