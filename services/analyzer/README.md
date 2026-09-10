# FLARE Analyzer

The FastAPI analysis engine. Runs inside Docker (Python 3.12) — never against the host's Python.

## What's implemented (this milestone)

- Safe intake: direct `.sol` uploads, project ZIPs (zip-slip / symlink / size-limit protected),
  and public GitHub URLs (shallow clone, no repository code ever executed).
- Compiler-version detection and compilation via `solc-select`.
- Slither-based static extraction into a normalized IR (`app/schemas/ir.py`).
- Content-hash caching in SQLite — an unchanged set of sources reuses its prior IR.
- A background-task pipeline: `POST /analyses/*` returns immediately with a `queued` record;
  poll `GET /analyses/{id}` for progress.

## What's not implemented yet

The detector registry, fund-flow graph, Foundry validation and risk scoring — see
[`docs/architecture`](../../apps/web/content/docs/architecture.mdx) and
[`docs/limitations`](../../apps/web/content/docs/limitations.mdx) for the up-to-date list. A
completed analysis today reports a normalized IR with zero findings.

## Running it

```bash
docker compose up analyzer        # from the repo root — http://localhost:8000
docker compose run --rm analyzer pytest -v
docker compose run --rm analyzer ruff check .
```

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/health` | Liveness check |
| GET | `/analyses` | List all analyses, newest first |
| GET | `/analyses/{id}` | Poll one analysis's status/result |
| POST | `/analyses/upload-files` | Multipart `.sol` file(s) |
| POST | `/analyses/upload-zip` | Multipart project ZIP |
| POST | `/analyses/github` | JSON `{"url": "https://github.com/owner/repo"}` |

## Environment variables

All optional — see `app/config.py` for defaults. None are required to run the service locally.

| Variable | Default | Purpose |
| --- | --- | --- |
| `FLARE_WORKSPACE_DIR` | `/tmp/flare-workspaces` | Per-analysis isolated extraction root |
| `FLARE_DB_PATH` | `/tmp/flare.db` | SQLite database path |
| `FLARE_AI_PROVIDER` | `disabled` | `disabled` \| `local` \| `api-key` |
| `FLARE_ETHERSCAN_API_KEY` | unset | Optional, enables the verified-contract-address intake method |
