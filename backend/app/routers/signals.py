from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.routers.filters import VIEW, CommonFilters, build_conditions, common_filters, where_from
from app.schemas.common import Page
from app.schemas.signal import AeRow

router = APIRouter(prefix="/api/reactions", tags=["reactions"])


@router.get("", response_model=Page[AeRow])
async def list_reactions(
    db: AsyncSession = Depends(get_db),
    f: CommonFilters = Depends(common_filters),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
) -> Page[AeRow]:
    conds, params = build_conditions(f)
    where = where_from(conds)

    total = (
        await db.scalar(
            text(f"SELECT count(*) FROM {VIEW} {where}"),
            params,
        )
    ) or 0

    rows = (
        await db.execute(
            text(f"""
                SELECT
                    id, drug_ingredient, drug_brand_name, reaction,
                    meddra_pt, meddra_soc, severity, is_serious,
                    language, source,
                    published_at::text AS published_at,
                    text
                FROM {VIEW} {where}
                ORDER BY published_at DESC, id DESC
                LIMIT :lim OFFSET :off
            """),
            {**params, "lim": page_size, "off": (page - 1) * page_size},
        )
    ).all()

    items = [
        AeRow(
            id=r.id,
            drug_ingredient=r.drug_ingredient,
            drug_brand_name=r.drug_brand_name,
            reaction=r.reaction,
            meddra_pt=r.meddra_pt,
            meddra_soc=r.meddra_soc,
            severity=r.severity,
            is_serious=r.is_serious or "No",
            language=r.language or "",
            source=r.source or "",
            published_at=r.published_at or "",
            text=r.text,
        )
        for r in rows
    ]

    return Page(items=items, total=total, page=page, page_size=page_size)
