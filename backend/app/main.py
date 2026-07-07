from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database import get_db
from app.routers import catalog, export, kpi, reviews, signals

app = FastAPI(
    title="Inno-Pulse API",
    version="1.0.0",
    description="Pharmacovigilance dashboard — social_adverse.v_ae_flat",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(kpi.router)
app.include_router(signals.router)
app.include_router(reviews.router)
app.include_router(catalog.router)
app.include_router(export.router)


@app.get("/api/health", tags=["health"])
async def health(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    await db.execute(text("SELECT 1"))
    return {"status": "ok", "schema": "social_adverse.v_ae_flat"}
