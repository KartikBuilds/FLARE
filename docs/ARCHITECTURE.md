# Architecture

## Monorepo layout

```
apps/web            Next.js 16 App Router frontend (TypeScript, Tailwind v4, Motion, GSAP)
packages/ui          Design-system primitives + original SVG illustration components
packages/schemas      Zod schemas mirroring the analyzer's Pydantic contracts
packages/graph        React Flow node/edge types + a dependency-free layout algorithm
packages/rules        Versioned detector registry spec (packages/rules/src/detectors.ts)
services/analyzer    Python 3.12 / FastAPI analysis engine — runs inside Docker, always
contracts/benchmarks Foundry project: 40 detector fixtures + 3 executable fund-lock proofs
research/incidents   Structured, cited, schema-validated case-study data
evaluation/           Generated benchmark results (services/analyzer/app/core/benchmark.py)
docs/                 This directory — repository-level reference documentation
```

The frontend and analyzer are separate services with a typed contract between them
(`packages/schemas` on the TS side, Pydantic models under `services/analyzer/app/schemas/` on
the Python side — kept in sync by hand, matched field-for-field via a shared `CamelModel` alias
generator so Python's snake_case internals still emit camelCase JSON). The web app renders
meaningfully even when the analyzer is unavailable or disabled — see `lib/engine-status.ts` and
`lib/api-client.ts` in `apps/web`.

## The analysis pipeline

```
input
  → safe extraction (path-traversal guards, size/extension limits, isolated workspace)
  → project validation
  → compiler-version detection (solc-select) + compilation
  → Slither extraction → normalized IR (services/analyzer/app/schemas/ir.py)
  → FLARE detector registry execution (services/analyzer/app/detectors/)
  → local Foundry/Anvil validation, for detector types where "call it and watch it
    revert" is a valid proof (services/analyzer/app/core/validation.py)
  → NetworkX fund-flow/dependency graph (services/analyzer/app/core/graph.py)
  → persisted, versioned result (SQLite, content-hash cached)
```

Implemented end to end, including the deterministic FLARE risk-scoring stage
(`app/core/scoring.py`, formula v2.0.0 — see [`RISK_METHODOLOGY.md`](RISK_METHODOLOGY.md)) and a
self-contained HTML report renderer (`app/core/report.py`, `GET /analyses/{id}/report.html`) —
exercised by 90 backend tests (`services/analyzer/tests/`), verified via real HTTP requests, and
proven end to end through the actual frontend (`tests/e2e/live-analysis.spec.ts`: a real
submission reaches a real, non-null score and a real downloadable/viewable report).

Every stage's output is cached by content hash (`services/analyzer/app/core/cache.py`), so
re-analyzing an unchanged project skips recompilation and re-analysis entirely.

## Adapter boundaries

| Adapter | Status | Implementation |
| --- | --- | --- |
| Source provider — files/ZIP | Implemented | `app/core/intake.py::validate_sol_files`, `extract_zip` |
| Source provider — GitHub URL | Implemented | `app/core/intake.py::clone_github_repo` (shallow clone, never executes repo code) |
| Source provider — verified address | Optional, not wired | Requires a user-supplied block-explorer API key; degrades cleanly when unset |
| Static analyzer | Implemented | `app/core/slither_service.py` (Slither, inside Docker) |
| Chain adapter — EVM/Solidity | Implemented | The only chain this prototype actually analyzes |
| Chain adapter — Solana/Rust | Interface-only stub | Not implemented; never claimed as working |
| Validation provider | Implemented, scoped | `app/core/validation.py` — local Anvil only, two detector types (FLARE-WD-001/002) |
| AI provider | Optional, disabled by default | No implementation calls an AI provider yet; the pipeline is fully functional without one |
| Report renderer | Partial | JSON download implemented (`AnalysisDetailClient.tsx`); HTML renderer not yet built |

## Why Docker for the analyzer

`services/analyzer` — Slither, `solc-select`, and Foundry — runs inside a Python 3.12 container
(`services/analyzer/Dockerfile`) rather than depending on whatever Python is on the host. Every
backend test/lint run goes through `docker compose run --rm analyzer ...`. Building this on
Apple Silicon surfaced a real issue: official `solc` static Linux builds and some Foundry
release assets are far more reliably available for `linux/amd64` than native `arm64` — the
image is pinned to `platform: linux/amd64` in `docker-compose.yml` (Rosetta/QEMU-emulated on
Apple Silicon hosts) to avoid partial architecture mismatches between individually-fetched
tool binaries.

## Performance and safety measures

- Content-hash result caching (SQLite) — `app/core/cache.py`.
- Background-task job model: `POST /analyses/*` returns a `queued` record immediately; the
  actual pipeline runs via FastAPI `BackgroundTasks`, polled through `GET /analyses/{id}`.
- Per-stage timeouts: Slither runs under a `ThreadPoolExecutor`-based timeout
  (`app/core/slither_service.py::_run_with_timeout`) — not `signal.alarm`, which cannot run
  outside the main thread (a real bug caught by testing under FastAPI's threaded test client).
- Project-size safeguards enforced before any analysis work begins (`app/config.py`:
  `max_upload_files`, `max_file_bytes`, `max_zip_bytes`, `max_extracted_bytes`).
- Route-level code splitting and lazy-loaded heavy visualizations on the frontend — the React
  Flow asset-flow graph is loaded via `next/dynamic({ ssr: false })`.
