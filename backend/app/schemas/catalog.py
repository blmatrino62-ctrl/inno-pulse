from app.schemas.common import FixedModel


class IngredientOut(FixedModel):
    name: str
    post_count: int
    reaction_count: int
    drug_category: str | None


class SourceOut(FixedModel):
    name: str
    reaction_count: int
    post_count: int


class PtNode(FixedModel):
    pt: str
    reaction_count: int
    serious_count: int


class SocNode(FixedModel):
    soc: str
    pt_count: int
    reaction_count: int
    serious_count: int
    pts: list[PtNode] = []


class TrendPoint(FixedModel):
    month: str
    source: str
    count: int
