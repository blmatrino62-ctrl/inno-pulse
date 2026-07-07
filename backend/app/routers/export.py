import csv
import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.routers.filters import VIEW, CommonFilters, build_conditions, common_filters, where_from
from app.schemas.common import _fix

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/csv")
async def export_csv(
    db: AsyncSession = Depends(get_db),
    f: CommonFilters = Depends(common_filters),
) -> StreamingResponse:
    conds, params = build_conditions(f)
    where = where_from(conds)

    rows = (
        await db.execute(
            text(f"""
                SELECT
                    drug_ingredient, drug_brand_name, reaction,
                    meddra_pt, meddra_soc, severity,
                    is_serious, language, source, published_at
                FROM {VIEW} {where}
                ORDER BY published_at DESC
                LIMIT 10000
            """),
            params,
        )
    ).all()

    buf = io.StringIO()
    # UTF-8 BOM so Excel detects the encoding
    buf.write("﻿")
    writer = csv.writer(buf)
    writer.writerow([
        "Ingredient", "Brand", "Reaction", "MedDRA PT", "MedDRA SOC",
        "Severity", "Serious", "Language", "Source", "Date",
    ])
    for r in rows:
        writer.writerow([
            _fix(r.drug_ingredient or ""),
            _fix(r.drug_brand_name or ""),
            _fix(r.reaction or ""),
            _fix(r.meddra_pt or ""),
            _fix(r.meddra_soc or ""),
            _fix(r.severity or ""),
            r.is_serious or "",
            r.language or "",
            r.source or "",
            str(r.published_at) if r.published_at else "",
        ])
    buf.seek(0)

    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=inno-pulse-ae.csv"},
    )
