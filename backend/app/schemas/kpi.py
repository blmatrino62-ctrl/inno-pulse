from pydantic import BaseModel


class Delta(BaseModel):
    value: float
    direction: str  # "up" | "down" | "flat"


class KpiResponse(BaseModel):
    ae_rows: int
    ae_rows_delta: Delta
    unique_posts: int
    reactions_per_post: float
    serious_pct: float
    serious_pct_delta: Delta
    unique_ingredients: int
    unique_brands: int
    meddra_pt_count: int
    meddra_soc_count: int
