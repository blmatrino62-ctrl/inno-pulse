# Inno-Pulse

Production pharmacovigilance dashboard for tracking adverse-event signals across
patient reviews, grouped by drug ingredient (INN) and mapped to MedDRA PT terms.

## Stack

| Layer    | Tech |
|----------|------|
| Backend  | FastAPI · asyncpg · SQLAlchemy 2.0 (async) · Alembic |
| Frontend | React 18 · Vite · TypeScript (strict) · TanStack Table/Query/Virtual · Recharts · Tailwind |
| DB       | PostgreSQL 15 |
| Deploy   | EC2 (Ubuntu 22.04) · Nginx · systemd · uvicorn |

## Project layout

```
backend/    FastAPI app, models, routers, Alembic migrations, seed script
frontend/   Vite React app (components, pages, api hooks, types)
nginx/      Nginx site config
deploy/     systemd unit
docker-compose.yml   Local Postgres + API
```

## Quick start (Docker, recommended for local)

```bash
docker compose up --build      # starts Postgres + API (migrates + seeds)
cd frontend && npm install && npm run dev
# open http://localhost:5173
```

## Quick start (manual)

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edit DATABASE_URL / SECRET_KEY
alembic upgrade head            # create schema
python -m app.seed             # load mock Novo Nordisk data
uvicorn app.main:app --reload   # http://localhost:8000  (docs: /docs)
```

### Frontend
```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173  (proxies /api -> :8000)
```

## API

| Endpoint            | Description |
|---------------------|-------------|
| `GET /api/kpi`      | 5 KPIs with 30-day deltas |
| `GET /api/signals`  | Paginated, aggregated signals (filters + trend %) |
| `GET /api/reviews`  | Paginated raw reviews |
| `GET /api/inn`      | INNs with brand names |
| `GET /api/sources`  | Review sources |
| `GET /api/export/csv` | CSV export honouring current filters |
| `GET /api/health`   | Health check |

Shared query params for `/signals`, `/reviews`, `/export/csv`:
`inn_id[]`, `year`, `source_id[]`, `severity`, `is_serious`, `lang`, `is_listed`,
plus `page` / `page_size`.

## EC2 deployment

1. **Provision**: Ubuntu 22.04, install `python3.12`, `nginx`, `postgresql-15`.
2. **Code**: clone to `/opt/inno-pulse`. Create venv in `backend/.venv`, install
   `requirements.txt`, write `backend/.env`, run `alembic upgrade head`.
3. **API service**: copy `deploy/inno-pulse-api.service` to
   `/etc/systemd/system/`, then `systemctl enable --now inno-pulse-api`.
4. **Frontend**: `cd frontend && npm ci && npm run build`, copy `dist/` to
   `/var/www/inno-pulse`.
5. **Nginx**: copy `nginx/inno-pulse.conf` to `/etc/nginx/sites-available/`,
   symlink into `sites-enabled/`, set `server_name`, `nginx -t && systemctl reload nginx`.
6. **CORS**: set `CORS_ORIGINS` in `.env` to your EC2 domain.

## Database schema

`inn` → `brand` (1:N) · `source` · `review` (FK inn/brand/source) ·
`meddra_pt` · `signal` (FK review/inn/meddra_pt, severity + is_listed) ·
`reference_label` (known signals per INN). See `backend/alembic/versions/`.
