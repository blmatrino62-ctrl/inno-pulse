from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.routers.filters import VIEW, CommonFilters, build_conditions, common_filters, where_from
from app.schemas.common import Page
from app.schemas.signal import PostRow

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.get("", response_model=Page[PostRow])
async def list_posts(
    db: AsyncSession = Depends(get_db),
    f: CommonFilters = Depends(common_filters),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
) -> Page[PostRow]:
    conds, params = build_conditions(f)
    where = where_from(conds)

    total = (
        await db.scalar(
            text(f"SELECT count(DISTINCT id) FROM {VIEW} {where}"),
            params,
        )
    ) or 0

    rows = (
        await db.execute(
            text(f"""
                SELECT
                    id,
                    max(drug_ingredient)        AS drug_ingredient,
                    max(drug_brand_name)        AS drug_brand_name,
                    max(language)               AS language,
                    max(source)                 AS source,
                    max(published_at)::text     AS published_at,
                    max(is_serious)             AS is_serious,
                    max(text)                   AS text,
                    array_agg(DISTINCT reaction ORDER BY reaction)
                        FILTER (WHERE reaction IS NOT NULL) AS reactions
                FROM {VIEW} {where}
                GROUP BY id
                ORDER BY max(published_at) DESC, id DESC
                LIMIT :lim OFFSET :off
            """),
            {**params, "lim": page_size, "off": (page - 1) * page_size},
        )
    ).all()

    items = [
        PostRow(
            id=r.id,
            drug_ingredient=r.drug_ingredient,
            drug_brand_name=r.drug_brand_name,
            language=r.language or "",
            source=r.source or "",
            published_at=r.published_at or "",
            is_serious=r.is_serious or "No",
            text=r.text,
            reactions=list(r.reactions or []),
        )
        for r in rows
    ]

    return Page(items=items, total=total, page=page, page_size=page_size)
