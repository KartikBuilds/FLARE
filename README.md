# FLARE — Fund-Lock Assessment & Risk Evaluation

FLARE is a research-backed platform that analyzes whether digital assets entering an EVM
smart-contract system can become permanently or practically inaccessible, because of **library
dependencies, withdrawal failures, missing recovery, state transitions,** or **transfer logic**.

Its central question:

> Can every asset entering this protocol reach a legitimate withdrawal, redemption, migration or
> recovery path under realistically reachable states?

FLARE is not a generic AI smart-contract auditing wrapper. The core detection engine is
deterministic and evidence-based (Slither + a normalized IR + a versioned FLARE detector
registry); an optional AI layer may only explain existing findings, never invent them.

## Status

This repository is being built milestone by milestone in the open. Every dashboard/demo record is
labeled **DEMO** until it comes from a real, completed analyzer run, at which point it carries a
**LIVE ENGINE** badge instead — never the reverse, and never silently. See
[`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) for exactly what is and isn't implemented right now.

## Monorepo layout

```
apps/web            Next.js App Router frontend (TypeScript, Tailwind CSS v4, Motion, GSAP)
packages/ui          Design-system primitives + original SVG illustration components
packages/schemas      Zod schemas mirroring the analyzer's Pydantic contracts
packages/graph        React Flow node/edge types + fund-flow layout helpers
packages/rules        TS mirror of the detector registry metadata, generated for docs/UI
services/analyzer    Python/FastAPI analysis engine (Slither, solc-select, Foundry, NetworkX)
contracts/benchmarks Foundry project: vulnerable / corrected / safe-control fixture contracts
research/incidents   Structured, cited case-study data (Parity, Perfect Finance, Lido stSOL, …)
evaluation           Benchmark runner output (precision/recall of the detector registry)
docs                 Research-alignment and architecture documentation (Markdown/MDX)
tests/e2e            Playwright critical-flow end-to-end tests
```

## Requirements

- Node.js ≥ 20.9, pnpm ≥ 9 (this repo was built against Node 26 / pnpm 11)
- Docker (the analyzer, Slither, solc-select and Foundry all run inside a Python 3.12 container —
  the host's Python is never used for analysis)

## Local development

```bash
pnpm install
pnpm dev              # apps/web on http://localhost:3000
pnpm typecheck
pnpm lint
pnpm test             # Vitest, per-package
docker compose up analyzer   # FastAPI analyzer service (see services/analyzer)
```

Fonts, illustrations and the palette are documented in
[`docs/FREE_RESOURCES.md`](docs/FREE_RESOURCES.md). Architecture is documented in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). The detector registry is documented in
[`docs/DETECTOR_SPECIFICATION.md`](docs/DETECTOR_SPECIFICATION.md). The scoring formula is
documented in [`docs/RISK_METHODOLOGY.md`](docs/RISK_METHODOLOGY.md).

## License

MIT — see [LICENSE](LICENSE). Vendored font files keep their own SIL Open Font License, included
alongside them in `apps/web/app/fonts/licenses/`.
