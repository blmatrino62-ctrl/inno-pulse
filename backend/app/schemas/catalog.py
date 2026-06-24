from pydantic import BaseModel


class IngredientOut(BaseModel):
    name: str
    post_count: int
    reaction_count: int
    drug_category: str | None


class SourceOut(BaseModel):
    name: str
    reaction_count: int
    post_count: int


class PtNode(BaseModel):
    pt: str
    reaction_count: int
    serious_count: int


class SocNode(BaseModel):
    soc: str
    pt_count: int
    reaction_count: int
    serious_count: int
    pts: list[PtNode] = []


class TrendPoint(BaseModel):
    month: str
    source: str
    count: int
