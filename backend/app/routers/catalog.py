from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.routers.filters import VIEW, CommonFilters, build_conditions, common_filters, where_from
from app.schemas.catalog import IngredientOut, PtNode, SocNode, SourceOut, TrendPoint

router = APIRouter(prefix="/api", tags=["catalog"])


@router.get("/ingredients", response_model=list[IngredientOut])
async def list_ingredients(
    db: AsyncSession = Depends(get_db),
) -> list[IngredientOut]:
    rows = (
        await db.execute(
            text(f"""
                SELECT
                    drug_ingredient                 AS name,
                    count(DISTINCT id)              AS post_count,
                    count(*)                        AS reaction_count,
                    max(drug_category)              AS drug_category
                FROM {VIEW}
                WHERE drug_ingredient IS NOT NULL
                GROUP BY drug_ingredient
                ORDER BY post_count DESC
            """)
        )
    ).all()
    return [
        IngredientOut(
            name=r.name,
            post_count=r.post_count,
            reaction_count=r.reaction_count,
            drug_category=r.drug_category,
        )
        for r in rows
    ]


@router.get("/sources", response_model=list[SourceOut])
async def list_sources(db: AsyncSession = Depends(get_db)) -> list[SourceOut]:
    rows = (
        await db.execute(
            text(f"""
                SELECT
                    source              AS name,
                    count(*)            AS reaction_count,
                    count(DISTINCT id)  AS post_count
                FROM {VIEW}
                WHERE source IS NOT NULL
                GROUP BY source
                ORDER BY reaction_count DESC
            """)
        )
    ).all()
    return [
        SourceOut(name=r.name, reaction_count=r.reaction_count, post_count=r.post_count)
        for r in rows
    ]


@router.get("/meddra-tree", response_model=list[SocNode])
async def get_meddra_tree(
    db: AsyncSession = Depends(get_db),
    f: CommonFilters = Depends(common_filters),
) -> list[SocNode]:
    conds, params = build_conditions(f)
    # Add required NOT NULL conditions
    all_conds = [*conds, "meddra_soc IS NOT NULL", "meddra_pt IS NOT NULL"]
    where = where_from(all_conds)

    rows = (
        await db.execute(
            text(f"""
                SELECT
                    meddra_soc,
                    meddra_pt,
                    count(*)                                    AS reaction_count,
                    count(*) FILTER (WHERE is_serious = 'Yes') AS serious_count
                FROM {VIEW} {where}
                GROUP BY meddra_soc, meddra_pt
                ORDER BY meddra_soc, reaction_count DESC
            """),
            params,
        )
    ).all()

    soc_map: dict[str, dict] = {}
    for r in rows:
        if r.meddra_soc not in soc_map:
            soc_map[r.meddra_soc] = {
                "soc": r.meddra_soc,
                "pt_count": 0,
                "reaction_count": 0,
                "serious_count": 0,
                "pts": [],
            }
        node = soc_map[r.meddra_soc]
        node["pts"].append(
            PtNode(
                pt=r.meddra_pt,
                reaction_count=r.reaction_count,
                serious_count=r.serious_count,
            )
        )
        node["pt_count"] += 1
        node["reaction_count"] += r.reaction_count
        node["serious_count"] += r.serious_count

    return [
        SocNode(**d)
        for d in sorted(soc_map.values(), key=lambda d: -d["reaction_count"])
    ]


@router.get("/trends", response_model=list[TrendPoint])
async def get_trends(db: AsyncSession = Depends(get_db)) -> list[TrendPoint]:
    rows = (
        await db.execute(
            text(f"""
                SELECT
                    to_char(date_trunc('month', published_at), 'YYYY-MM') AS month,
                    source,
                    count(*) AS cnt
                FROM {VIEW}
                WHERE published_at IS NOT NULL AND source IS NOT NULL
                GROUP BY 1, 2
                ORDER BY 1, 2
            """)
        )
    ).all()
    return [
        TrendPoint(month=r.month, source=r.source, count=r.cnt)
        for r in rows
    ]
