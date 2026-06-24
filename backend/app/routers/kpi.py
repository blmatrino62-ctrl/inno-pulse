from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.routers.filters import VIEW, CommonFilters, build_conditions, common_filters, where_from
from app.schemas.kpi import Delta, KpiResponse

router = APIRouter(prefix="/api/kpi", tags=["kpi"])

WINDOW_DAYS = 30


def _delta(current: float, previous: float) -> Delta:
    if previous == 0:
        pct = 100.0 if current > 0 else 0.0
    else:
        pct = round((current - previous) / previous * 100, 1)
    direction = "up" if pct > 0 else "down" if pct < 0 else "flat"
    return Delta(value=abs(pct), direction=direction)


@router.get("", response_model=KpiResponse)
async def get_kpi(
    db: AsyncSession = Depends(get_db),
    f: CommonFilters = Depends(common_filters),
) -> KpiResponse:
    today = date.today()
    cur_start = today - timedelta(days=WINDOW_DAYS)
    prev_start = today - timedelta(days=2 * WINDOW_DAYS)

    conds, params = build_conditions(f)
    where = where_from(conds)

    # --- Main aggregates (all time) ---
    row = (
        await db.execute(
            text(f"""
                SELECT
                    count(*)                                                    AS ae_rows,
                    count(DISTINCT id)                                          AS unique_posts,
                    count(*) FILTER (WHERE is_serious = 'Yes') * 100.0
                        / NULLIF(count(*), 0)                                  AS serious_pct,
                    count(DISTINCT drug_ingredient)
                        FILTER (WHERE drug_ingredient IS NOT NULL)             AS unique_ingredients,
                    count(DISTINCT drug_brand_name)
                        FILTER (WHERE drug_brand_name IS NOT NULL)             AS unique_brands,
                    count(DISTINCT meddra_pt)
                        FILTER (WHERE meddra_pt IS NOT NULL)                   AS meddra_pt_count,
                    count(DISTINCT meddra_soc)
                        FILTER (WHERE meddra_soc IS NOT NULL)                  AS meddra_soc_count
                FROM {VIEW} {where}
            """),
            params,
        )
    ).one()

    ae_rows = int(row.ae_rows or 0)
    unique_posts = int(row.unique_posts or 0)
    reactions_per_post = round(ae_rows / unique_posts, 2) if unique_posts else 0.0
    serious_pct = round(float(row.serious_pct or 0), 1)

    # --- AE rows trend (last 30d vs prior 30d) ---
    cur_conds = [*conds, "published_at >= :cur_start"]
    prev_conds = [*conds, "published_at >= :prev_start", "published_at < :cur_start"]

    cur_ae = (
        await db.scalar(
            text(f"SELECT count(*) FROM {VIEW} {where_from(cur_conds)}"),
            {**params, "cur_start": cur_start},
        )
    ) or 0

    prev_ae = (
        await db.scalar(
            text(f"SELECT count(*) FROM {VIEW} {where_from(prev_conds)}"),
            {**params, "prev_start": prev_start, "cur_start": cur_start},
        )
    ) or 0

    # --- Serious % trend ---
    async def serious_pct_window(extra_conds: list[str], extra_params: dict) -> float:
        r = (
            await db.execute(
                text(f"""
                    SELECT
                        count(*) FILTER (WHERE is_serious = 'Yes') * 100.0
                            / NULLIF(count(*), 0) AS pct
                    FROM {VIEW} {where_from([*conds, *extra_conds])}
                """),
                {**params, **extra_params},
            )
        ).one()
        return round(float(r.pct or 0), 1)

    serious_cur = await serious_pct_window(
        ["published_at >= :cur_start"], {"cur_start": cur_start}
    )
    serious_prev = await serious_pct_window(
        ["published_at >= :prev_start", "published_at < :cur_start"],
        {"prev_start": prev_start, "cur_start": cur_start},
    )

    return KpiResponse(
        ae_rows=ae_rows,
        ae_rows_delta=_delta(cur_ae, prev_ae),
        unique_posts=unique_posts,
        reactions_per_post=reactions_per_post,
        serious_pct=serious_pct,
        serious_pct_delta=_delta(serious_cur, serious_prev),
        unique_ingredients=int(row.unique_ingredients or 0),
        unique_brands=int(row.unique_brands or 0),
        meddra_pt_count=int(row.meddra_pt_count or 0),
        meddra_soc_count=int(row.meddra_soc_count or 0),
    )
