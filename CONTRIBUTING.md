# Contributing to FLARE

Thanks for your interest in FLARE. This is a research-backed fund-lock analysis platform — see
[`README.md`](README.md) for what it is and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for
how it's built.

## Local setup

```bash
pnpm install
pnpm dev                       # apps/web on http://localhost:3000 (or the next free port)
docker compose up analyzer     # services/analyzer on http://localhost:8000
```

The analyzer, Slither, solc-select and Foundry all run **inside Docker** (Python 3.12) — never
against your host Python. Every backend command goes through `docker compose run --rm analyzer
...`.

## Quality gates

Before opening a PR, all of these should pass:

```bash
pnpm -r typecheck
pnpm -r lint
pnpm -r test                                            # Vitest, per package
docker compose run --rm analyzer pytest -v
docker compose run --rm analyzer ruff check .
docker compose run --rm -w /srv/contracts/benchmarks analyzer forge test
pnpm --filter web build
docker compose config                                    # validates docker-compose.yml
```

## Adding a detector

See [`docs/DETECTOR_SPECIFICATION.md`](docs/DETECTOR_SPECIFICATION.md) for the full contract.
In short, a new detector needs:

1. A spec entry in `packages/rules/src/detectors.ts` (`status: "planned"` until the
   implementation lands).
2. An implementation in `services/analyzer/app/detectors/<name>.py`, registered in
   `services/analyzer/app/detectors/registry.py`.
3. Four fixtures in `contracts/benchmarks/flare-<id>/`: `vulnerable.sol`, `corrected.sol`,
   `safe-negative.sol`, `false-positive.sol`, plus a `ground-truth.json`.
4. A passing run of `services/analyzer/tests/test_detectors.py` and the benchmark runner
   (`docker compose run --rm analyzer python3 -m app.core.benchmark ...`).
5. Flip the spec's `status` to `"implemented"` — this flows through to `/docs/detectors`
   automatically, no separate edit needed.

## Adding documentation content

Website documentation lives as MDX in `apps/web/content/docs/*.mdx` — never duplicate content
that's already structured data (taxonomy, incidents, detectors); render it from
`packages/schemas` / `packages/rules` / `research/incidents` instead, the way
`apps/web/app/(site)/docs/taxonomy/page.tsx` does.

## Commit and PR conventions

- Conventional-commit-style messages (`feat:`, `fix:`, `docs:`, ...).
- Keep the working tree free of secrets, `.env` files, and build artifacts (see `.gitignore`).
- Don't fabricate benchmark results, financial figures, or implementation status — if something
  isn't done, say so in [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) rather than implying it.

## Reporting a security issue

See [`SECURITY.md`](SECURITY.md) — please don't open a public issue for a vulnerability.
