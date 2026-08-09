# Setting up Inno-Pulse on a new machine

Checklist to get the project (and Claude Code) working from a fresh clone.

## 1. Clone

```powershell
cd C:\Users\user\Projects
git clone https://github.com/blmatrino62-ctrl/inno-pulse.git
cd inno-pulse
```

> Clone into `C:\Users\user\Projects\inno-pulse` so paths match the rest of the docs.
> Git remotes for the `blmatrino62-ctrl` repos must use **HTTPS** (this account's SSH key
> may belong to a different GitHub user). If a push says "Repository not found":
> `git remote set-url origin https://github.com/blmatrino62-ctrl/inno-pulse.git`

## 2. Install toolchain

| Tool | Notes |
|---|---|
| **Node 24** | for the frontend (`npm`) |
| **Python** | the `py` launcher (3.14). There is NO `python` command on this setup |
| **psycopg (v3)** | `py -m pip install psycopg` — for ad-hoc DB inspection (asyncpg/psycopg2 not used) |
| **Docker Desktop** | required for the dev/prod API containers; **must be started manually** |
| **gh** (GitHub CLI) | `gh auth login` → choose **HTTPS** |

## 3. Secrets & files that are NOT in git

These do not come with `git clone` — copy them from the old machine (or recreate):

1. **`backend/.env`** — the DB connection string. Create it:
   ```
   DATABASE_URL=postgresql+asyncpg://<user>:<pass>@15.237.137.224:5432/postgres
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ENVIRONMENT=development
   ```
   (Credentials are the ones used in `docker-compose.prod.yml`.)

2. **EC2 SSH key** — copy `inno-ec2-key.pem` to `C:\Users\user\Downloads\` (or anywhere;
   just update the path in the ssh command below).

3. **Claude memory (optional)** — the accumulated project memory lives at
   `C:\Users\user\.claude\projects\C--Users-user-Projects-inno-pulse\memory\`.
   `CLAUDE.md` (in this repo) already gives Claude the essentials, so this is optional;
   copy the folder for full continuity of past-session recall.

## 4. Run it

```powershell
docker compose up -d --build          # API on :8000 (start Docker Desktop first)
cd frontend; npm install; npm run dev  # Vite on :5173
# open http://localhost:5173  (demo / demo2024)
```

## 5. Connect to the server

```
ssh -i C:\Users\user\Downloads\inno-ec2-key.pem ec2-user@15.237.137.224
```
Amazon Linux, user `ec2-user`. The "post-quantum key exchange" warning is harmless.

## 6. Verify

- API health: open `http://localhost:8000/api/health` → `{"status":"ok",...}`
- Dashboard loads and shows data at `http://localhost:5173`.
- If data looks garbled (Cyrillic/German): that's the CP437 issue — the `FixedModel` layer
  in `backend/app/schemas/common.py` handles it; make sure the backend rebuilt.

---
For architecture details and gotchas, see [`CLAUDE.md`](CLAUDE.md).
