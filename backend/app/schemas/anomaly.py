from app.schemas.common import FixedModel


class PeriodStats(FixedModel):
    date_from: str
    date_to: str
    days: int
    mentions: int
    rate_per_day: float


class PtAnomaly(FixedModel):
    pt: str
    baseline_count: int
    baseline_rate: float
    recent_count: int
    recent_rate: float
    pct_change: float | None
    is_spike: bool


class AnomalyReport(FixedModel):
    window_days: int
    threshold_pct: float
    baseline: PeriodStats
    recent: PeriodStats
    overall_pct_change: float | None
    overall_is_spike: bool
    top_spikes: list[PtAnomaly]
    # Top reactions by recent volume (spike or not) — for the combo chart:
    # baseline_rate as bars, recent_rate as the overlay line.
    series: list[PtAnomaly]
