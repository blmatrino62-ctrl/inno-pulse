# Inno-Pulse

Pharmacovigilance dashboard for adverse-event (AE) signals mined from social-media posts
(Twitter/X, Reddit, Facebook), mapped to MedDRA PT/SOC terms and grouped by drug ingredient
(INN) and brand.

> **New machine / new to the repo?** See [`SETUP-NEW-MACHINE.md`](SETUP-NEW-MACHINE.md) for the
> full checklist, and [`CLAUDE.md`](CLAUDE.md) for the architecture guide.

## Stack

| Layer    | Tech |
|----------|------|
| Backend  | FastAPI · asyncpg · SQLAlchemy 2.0 (async, raw `text()` queries — no ORM/migrations) |
| Frontend | React 18 · Vite · TypeScript (strict) · TanStack Query · Recharts · Tailwind |
| DB       | PostgreSQL (remote, read-only view) |
| Deploy   | EC2 · Docker Compose (api + nginx) behind host nginx at sub-path `/inno-pulse/` |

## Data & constraints

- The backend is **read-only** — it only runs `SELECT` against the view
  `social_adverse.v_ae_flat` on a remote EC2 Postgres. No writes, no migrations, no seed.
- Connection string is read from `backend/.env` (gitignored) or the `DATABASE_URL` env var.

## Project layout

```
backend/    FastAPI app — routers (raw SQL), Pydantic schemas, config
frontend/   Vite React app — components, pages, api hooks, types
nginx/      nginx config for the prod container
deploy/     deploy helper scripts
docker-compose.yml        DEV: api container only (--reload)
docker-compose.prod.yml   PROD: api + nginx containers
CLAUDE.md                 architecture guide (read this first)
SETUP-NEW-MACHINE.md      onboarding checklist for a fresh machine
```

## Quick start (local)

Requires Docker Desktop running, Node 24, and a `backend/.env` with `DATABASE_URL`.

```bash
docker compose up -d --build     # API on :8000 (source-mounted, --reload)
cd frontend && npm install && npm run dev   # Vite on :5173, proxies /api -> :8000
# open http://localhost:5173
```

## API

Base path is `/api`. All list endpoints accept the shared filter params:
`drug_ingredient[]`, `drug_brand_name[]`, `meddra_soc`, `meddra_pt`, `severity[]`,
`is_serious`, `language`, `source`, `drug_category`, `date_from`, `date_to`
(plus `page` / `page_size` where paginated).

| Endpoint | Description |
|---|---|
| `GET /api/kpi` | KPI cards with 30-day deltas |
| `GET /api/reactions` | Paginated flat AE rows |
| `GET /api/reviews` | Paginated distinct posts with reactions[] |
| `GET /api/ingredients` · `/brands` · `/sources` | Catalog lists with counts |
| `GET /api/meddra-tree` | SOC→PT tree with serious counts (filter-aware) |
| `GET /api/top-reactions` · `/top-brands` | Top-10 bar-chart data (filter-aware) |
| `GET /api/anomalies` | Baseline-vs-recent spike detection |
| `GET /api/trends` | Monthly counts by source |
| `GET /api/export/csv` | Filtered CSV export (UTF-8 BOM) |
| `GET /api/health` | Health check (pings DB) |

## Deployment (EC2)

Served at `http://15.237.137.224/inno-pulse/`. The host nginx proxies `/inno-pulse/` →
`localhost:8081`, where the app's own nginx container serves the frontend and proxies
`/api/` to the api container.

```bash
# on the EC2 box
cd ~/inno-pulse && git pull
cd frontend && npm run build && cd ..
docker compose -f docker-compose.prod.yml up -d --build
```

See [`SETUP-NEW-MACHINE.md`](SETUP-NEW-MACHINE.md) for SSH access and first-time setup.
