from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.routers.filters import VIEW, CommonFilters, build_conditions, common_filters, where_from
from app.schemas.anomaly import AnomalyReport, PeriodStats, PtAnomaly

router = APIRouter(prefix="/api/anomalies", tags=["anomalies"])

# Reactions with fewer than this many mentions in the recent window are
# skipped — otherwise a jump from 1 to 2 mentions reports as a "100% spike".
MIN_RECENT_COUNT = 3

_EMPTY_PERIOD = PeriodStats(date_from="", date_to="", days=0, mentions=0, rate_per_day=0.0)


def _pct_change(baseline_rate: float, recent_rate: float) -> float | None:
    if baseline_rate <= 0:
        return None if recent_rate <= 0 else 100.0
    return round((recent_rate - baseline_rate) / baseline_rate * 100, 1)


@router.get("", response_model=AnomalyReport)
async def get_anomalies(
    db: AsyncSession = Depends(get_db),
    f: CommonFilters = Depends(common_filters),
    window_days: int = Query(30, ge=1, le=365, description="Size of the 'recent' window, in days"),
    threshold_pct: float = Query(50.0, ge=0, description="Flag as spike when mentions/day rise by at least this %"),
) -> AnomalyReport:
    """
    Compares the most recent `window_days` of data against everything before
    it (the baseline). The whole existing dataset stands in for a historical
    reference period; once live ingestion exists, the same query keeps working
    unchanged — "recent" simply becomes real new data instead of the tail end
    of the archive.
    """
    conds, params = build_conditions(f)
    where = where_from(conds)

    bounds = (
        await db.execute(
            text(f"SELECT min(published_at) AS min_d, max(published_at) AS max_d FROM {VIEW} {where}"),
            params,
        )
    ).one()

    if bounds.min_d is None or bounds.max_d is None:
        return AnomalyReport(
            window_days=window_days,
            threshold_pct=threshold_pct,
            baseline=_EMPTY_PERIOD,
            recent=_EMPTY_PERIOD,
            overall_pct_change=None,
            overall_is_spike=False,
            top_spikes=[],
        )

    max_d: date = bounds.max_d
    min_d: date = bounds.min_d
    cutoff = max_d - timedelta(days=window_days)
    baseline_days = max((cutoff - min_d).days, 1)
    recent_days = window_days

    overall = (
        await db.execute(
            text(f"""
                SELECT
                    count(*) FILTER (WHERE published_at < :cutoff)  AS baseline_count,
                    count(*) FILTER (WHERE published_at >= :cutoff) AS recent_count
                FROM {VIEW} {where}
            """),
            {**params, "cutoff": cutoff},
        )
    ).one()

    baseline_count = int(overall.baseline_count or 0)
    recent_count = int(overall.recent_count or 0)
    baseline_rate = round(baseline_count / baseline_days, 3)
    recent_rate = round(recent_count / recent_days, 3)
    overall_pct = _pct_change(baseline_rate, recent_rate)
    overall_spike = overall_pct is not None and overall_pct >= threshold_pct

    pt_conds = [*conds, "meddra_pt IS NOT NULL"]
    pt_rows = (
        await db.execute(
            text(f"""
                SELECT
                    meddra_pt,
                    count(*) FILTER (WHERE published_at < :cutoff)  AS baseline_count,
                    count(*) FILTER (WHERE published_at >= :cutoff) AS recent_count
                FROM {VIEW} {where_from(pt_conds)}
                GROUP BY meddra_pt
            """),
            {**params, "cutoff": cutoff},
        )
    ).all()

    spikes: list[PtAnomaly] = []
    for r in pt_rows:
        b_count = int(r.baseline_count or 0)
        r_count = int(r.recent_count or 0)
        if r_count < MIN_RECENT_COUNT:
            continue
        b_rate = round(b_count / baseline_days, 4)
        r_rate = round(r_count / recent_days, 4)
        pct = _pct_change(b_rate, r_rate)
        if pct is not None and pct >= threshold_pct:
            spikes.append(
                PtAnomaly(
                    pt=r.meddra_pt,
                    baseline_count=b_count,
                    baseline_rate=b_rate,
                    recent_count=r_count,
                    recent_rate=r_rate,
                    pct_change=pct,
                    is_spike=True,
                )
            )

    spikes.sort(key=lambda s: -(s.pct_change or 0))

    return AnomalyReport(
        window_days=window_days,
        threshold_pct=threshold_pct,
        baseline=PeriodStats(
            date_from=str(min_d),
            date_to=str(cutoff),
            days=baseline_days,
            mentions=baseline_count,
            rate_per_day=baseline_rate,
        ),
        recent=PeriodStats(
            date_from=str(cutoff),
            date_to=str(max_d),
            days=recent_days,
            mentions=recent_count,
            rate_per_day=recent_rate,
        ),
        overall_pct_change=overall_pct,
        overall_is_spike=overall_spike,
        top_spikes=spikes[:15],
    )
