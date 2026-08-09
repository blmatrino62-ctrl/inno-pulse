# Inno-Pulse — project guide for Claude

Pharmacovigilance dashboard: adverse-event (AE) signals mined from **social-media posts**
(Twitter/X, Reddit, Facebook), mapped to MedDRA PT/SOC terms, grouped by drug ingredient
(INN) and brand. Read this file first — it reflects the CURRENT architecture (the human
`README.md` is stale: it still mentions Alembic/seed/local Postgres, which no longer exist).

> A sibling project, **inno-pulse-lit**, is a fork of this one for AEs in medical-journal
> articles (view `novo_nordisk_ae_poc_kz.v_ae_journals_flat`). Different repo, different DB
> view. Don't mix them up.

## ⚠ Critical constraint — READ-ONLY DATABASE

The backend is **100% read-only** against the DB. **Only `SELECT`.** Never write, update,
delete, or run DDL/migrations. (User rule, verbatim: "только ничего не удаляй. только читай".)

## Data source

- **DB:** EC2 Postgres `15.237.137.224:5432/postgres` (same box as the deployed app).
  Connection string lives in `backend/.env` (gitignored) or the `DATABASE_URL` env var in
  the compose files — do not hardcode creds in source.
- **View:** `social_adverse.v_ae_flat`. ~5,400 AE rows / ~3,100 distinct posts / 473
  ingredients / 666 MedDRA PT / 27 SOC. Languages EN/RU/DE. `is_serious` is text `"Yes"`/`"No"`
  (not boolean). Severity is mostly `unk`. Dates are synthetic.
- Ad-hoc DB inspection on Windows: `py` + **psycopg (v3)** is installed (no asyncpg/psycopg2,
  and there is NO `python` command — only `py`, which is 3.14).

## Stack

- **Backend:** FastAPI 0.111 + async SQLAlchemy 2.0 + asyncpg. **No ORM models, no Alembic,
  no seed.** All queries are raw `sqlalchemy.text()` against the view.
  - `backend/app/routers/filters.py` — `CommonFilters` dataclass + `common_filters` dependency
    + `build_conditions()` / `where_from()` compose the WHERE clause. `VIEW` constant = the view name.
  - Routers: `kpi.py` (/api/kpi), `signals.py` (/api/reactions), `reviews.py` (/api/reviews),
    `catalog.py` (/api/ingredients, /brands, /sources, /meddra-tree, /top-reactions,
    /top-brands, /trends), `anomalies.py` (/api/anomalies), `export.py` (/api/export/csv).
  - **Gotcha — IN clauses, not `ANY(:param)`:** multi-value filters build explicit
    `IN (:x0,:x1,...)` placeholders to avoid asyncpg array-binding issues. Follow that pattern.
  - **Gotcha — CP437 mojibake:** the social DB stores UTF-8 bytes in a CP437-encoded database,
    so Cyrillic/German comes out garbled. `backend/app/schemas/common.py` has `_fix()` +
    `FixedModel` (a Pydantic base that reverses it on every string field). All response models
    inherit `FixedModel`. CSV export applies `_fix()` + writes a UTF-8 BOM.
- **Frontend:** React 18 + Vite + TypeScript (strict) + TanStack Query + Recharts + Tailwind.
  - Filter state is synced to URL search params via `frontend/src/hooks/useFilters.ts`.
  - API base URL uses `import.meta.env.BASE_URL` (`frontend/src/api/client.ts`) so it resolves
    to `/inno-pulse/api` in prod and `/api` in dev.
  - Pages: `SignalsPage` (/reactions — MedDRA tree, charts, anomaly combo chart),
    `ReviewsPage` (/reviews), `DrugsPage` (/drugs), `NotificationsPage` (/notifications, alerts),
    `LoginPage` (/login). Demo auth: `demo` / `demo2024`, localStorage `inno-auth`,
    guarded by `ProtectedRoute`. Light theme by default.
  - Critical-AE highlighting: `frontend/src/utils/criticalPts.ts` (red rows/pills/badges for
    death, cardiac arrest, haemorrhage, suicidal ideation, etc.).

## Known data-quality issue (open)

Some `drug_ingredient` values in `v_ae_flat` are actually **brand names** (e.g. `humira`
should be ingredient `adalimumab`). ~44 ingredients match brand-name entries; all bucketed
as category `other`, brand `NULL`. Fix must be app-layer (DB is read-only) via a curated
brand→INN map — pending user review of the mapping. Not yet implemented.

## Run locally

```bash
# Backend (API on :8000, source-mounted with --reload). Needs Docker Desktop running.
docker compose up -d --build
# Frontend (Vite on :5173, proxies /api -> :8000)
cd frontend && npm install && npm run dev
```
Docker Desktop must be started manually (Start menu) — check `docker info` first.
There is a `.claude/launch.json` config named `frontend` for the preview tools.

## Build & deploy (EC2, Docker, sub-path /inno-pulse/)

Prod serves at `http://15.237.137.224/inno-pulse/` — port 80 is shared with another project,
so this app runs behind the host nginx which proxies `/inno-pulse/` → `localhost:8081`.

```bash
# on EC2 (see SSH command below)
cd ~/inno-pulse && git pull
cd frontend && npm run build && cd ..
docker compose -f docker-compose.prod.yml up -d --build   # api + nginx containers
```
- `docker-compose.prod.yml`: `api` (uvicorn, 4 workers) + `nginx` (`8081:80`, serves
  `frontend/dist`, proxies `/api/` → `api:8000`). DB reached via `host.docker.internal` +
  `extra_hosts: host-gateway`.
- Sub-path wiring: `vite.config.ts` `base: "/inno-pulse/"` + `main.tsx`
  `basename="/inno-pulse"` + host nginx `location /inno-pulse/`.

## SSH to the server

```
ssh -i C:\Users\user\Downloads\inno-ec2-key.pem ec2-user@15.237.137.224
```
Amazon Linux, user `ec2-user`. The "post-quantum key exchange" warning is harmless.

## Git / GitHub note

This machine's SSH key authenticates to GitHub as a DIFFERENT account, so git remotes for
the `blmatrino62-ctrl` repos must use **HTTPS**, not SSH. `gh` is authenticated over HTTPS.

## Security caveats (flag, don't silently rely on)

- DB port 5432 is open to the world with weak creds already in git history.
- Login is client-side only (localStorage); the API itself has no auth. Fine for demo, not prod.
