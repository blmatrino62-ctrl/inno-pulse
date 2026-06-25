from app.schemas.common import FixedModel


class AeRow(FixedModel):
    id: int
    drug_ingredient: str | None
    drug_brand_name: str | None
    reaction: str | None
    meddra_pt: str | None
    meddra_soc: str | None
    severity: str | None
    is_serious: str
    language: str
    source: str
    published_at: str
    text: str | None


class PostRow(FixedModel):
    id: int
    drug_ingredient: str | None
    drug_brand_name: str | None
    language: str
    source: str
    published_at: str
    is_serious: str
    text: str | None
    reactions: list[str]
