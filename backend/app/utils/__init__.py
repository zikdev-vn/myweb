

from fastapi import FastAPI
from app.utils.security import router as verify_turnstile_router



def include_security_routes(app: FastAPI):
    app.include_router(verify_turnstile_router, prefix="/api")
