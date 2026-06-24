from dataclasses import dataclass, field
from datetime import date

from fastapi import Query

VIEW = "social_adverse.v_ae_flat"


@dataclass
class CommonFilters:
    drug_ingredient: list[str] = field(default_factory=list)
    drug_brand_name: list[str] = field(default_factory=list)
    meddra_soc: str | None = None
    meddra_pt: str | None = None
    severity: list[str] = field(default_factory=list)
    is_serious: bool | None = None
    language: str | None = None
    source: str | None = None
    drug_category: str | None = None
    date_from: date | None = None
    date_to: date | None = None


def common_filters(
    drug_ingredient: list[str] = Query(default=[]),
    drug_brand_name: list[str] = Query(default=[]),
    meddra_soc: str | None = Query(default=None),
    meddra_pt: str | None = Query(default=None),
    severity: list[str] = Query(default=[]),
    is_serious: bool | None = Query(default=None),
    language: str | None = Query(default=None),
    source: str | None = Query(default=None),
    drug_category: str | None = Query(default=None),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
) -> CommonFilters:
    return CommonFilters(
        drug_ingredient=drug_ingredient,
        drug_brand_name=drug_brand_name,
        meddra_soc=meddra_soc,
        meddra_pt=meddra_pt,
        severity=severity,
        is_serious=is_serious,
        language=language,
        source=source,
        drug_category=drug_category,
        date_from=date_from,
        date_to=date_to,
    )


def build_conditions(f: CommonFilters) -> tuple[list[str], dict]:
    """Returns (conditions list without WHERE, params dict)."""
    conds: list[str] = []
    params: dict = {}

    if f.drug_ingredient:
        # Build explicit IN clause to avoid asyncpg array binding ambiguity
        ph = ", ".join(f":di{i}" for i in range(len(f.drug_ingredient)))
        conds.append(f"drug_ingredient IN ({ph})")
        for i, v in enumerate(f.drug_ingredient):
            params[f"di{i}"] = v

    if f.drug_brand_name:
        ph = ", ".join(f":db{i}" for i in range(len(f.drug_brand_name)))
        conds.append(f"drug_brand_name IN ({ph})")
        for i, v in enumerate(f.drug_brand_name):
            params[f"db{i}"] = v

    if f.meddra_soc:
        conds.append("meddra_soc = :meddra_soc")
        params["meddra_soc"] = f.meddra_soc

    if f.meddra_pt:
        conds.append("meddra_pt = :meddra_pt")
        params["meddra_pt"] = f.meddra_pt

    if f.severity:
        ph = ", ".join(f":sev{i}" for i in range(len(f.severity)))
        conds.append(f"severity IN ({ph})")
        for i, v in enumerate(f.severity):
            params[f"sev{i}"] = v

    if f.is_serious is not None:
        conds.append("is_serious = :is_serious")
        params["is_serious"] = "Yes" if f.is_serious else "No"

    if f.language:
        conds.append("language = :language")
        params["language"] = f.language

    if f.source:
        conds.append("source = :source")
        params["source"] = f.source

    if f.drug_category:
        conds.append("drug_category = :drug_category")
        params["drug_category"] = f.drug_category

    if f.date_from:
        conds.append("published_at >= :date_from")
        params["date_from"] = f.date_from

    if f.date_to:
        conds.append("published_at <= :date_to")
        params["date_to"] = f.date_to

    return conds, params


def where_from(conds: list[str]) -> str:
    return "WHERE " + " AND ".join(conds) if conds else ""
