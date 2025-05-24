from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import include_all_routes
from app.utils import include_security_routes
from app.database import create_tables
from fastapi_limiter import FastAPILimiter
import redis.asyncio as redis
import uvicorn
from app.routes.gui.gui_import import submit_form
from fastapi.staticfiles import StaticFiles


create_tables()
app = FastAPI()
app.mount("/images", StaticFiles(directory="app/routes/images"), name="images")
# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Có thể chỉnh theo domain cụ thể khi deploy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Thêm startup event để init rate limiter
@app.on_event("startup")
async def startup():
    redis_client = redis.from_url("redis://localhost", encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis_client)

# Đăng ký các router
include_all_routes(app)
include_security_routes(app)

submit_form()

if __name__ == "__main__":
    uvicorn.run("run:app", host="0.0.0.0", port=8000, reload=True)
