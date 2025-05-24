from fastapi import FastAPI
from app.routes.Register.register import router as register_router
from app.routes.Login.login import router as login_router
from app.routes.checkout.momoapi import router as momo_router
from app.routes.products.products import router as product_router
from app.routes.transaction.transaction import router as TransactionHistory  # hoặc tên bạn đặt



def include_all_routes(app: FastAPI):
    app.include_router(register_router, prefix="/api")
    app.include_router(login_router, prefix="/api")
    app.include_router(product_router, prefix="/api")
    app.include_router(momo_router, prefix="/api")
    # app.include_router(contact_router, prefix="/api")
    app.include_router(TransactionHistory, prefix="/api")