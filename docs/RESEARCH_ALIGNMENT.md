# Research Alignment

This document maps the five research objectives (RO1–RO5) this project was proposed against to
the actual implementation, file by file, so the claim "the implementation follows the accepted
proposal" can be checked rather than taken on faith.

## RO1 — Build a verifiable incident corpus

**Claim:** collect real fund-lock incidents, verify their facts against primary sources, and
represent disputed or unconfirmed details honestly.

**Implementation:**
- `research/incidents/*.json` — five structured, schema-validated incident records (Parity 2017,
  Lido stSOL 2024, Renzo ezETH 2024, Gemholic zkSync 2023/2024, and "Perfect Finance" 2023).
- `packages/schemas/src/incident.ts` — the `Incident` Zod schema every record is validated
  against, including `amountVerificationStatus` (`verified` / `disputed` / `unverified`) and
  `amount.category` (`locked-principal` / `liquidation-impact` / `post-recovery-allegation` /
  `unverified`), so incompatible kinds of dollar figures are never silently summed.
- `apps/web/lib/incidents.ts` — the loader every page reads from; `getVerifiedLockedTotalUsd()`
  sums *only* verified locked-principal figures.
- `apps/web/app/(site)/docs/case-studies/` and the home page's case-studies section render this
  data directly — no incident fact is hard-coded into a component.
- The "Perfect Finance" (2023) entry is deliberately kept, flagged `unverified`, with an
  explanation of what we searched and didn't find — see
  `research/incidents/perfect-finance-2023-unverified.json`.

## RO2 — Define a checkable taxonomy and a matching detector registry

**Claim:** a taxonomy is only useful if every category maps to something a detector can check.

**Implementation:**
- `packages/schemas/src/taxonomy.ts` — the five-category taxonomy (library-dependencies,
  withdrawal-failures, missing-recovery, state-transitions, transfer-logic), each with a
  `detail` description and example `signals`.
- `packages/rules/src/detectors.ts` — the versioned detector registry spec (ten detectors, two
  per category), each with a stable id (`FLARE-<CATEGORY>-<NUMBER>`), a taxonomy mapping, and an
  `evidenceRequirement`.
- `services/analyzer/app/detectors/` — the actual deterministic Python implementation of all ten
  detectors, operating only on the normalized IR (`services/analyzer/app/schemas/ir.py`), never
  on Slither objects directly and never on an LLM's opinion.
- See [`DETECTOR_SPECIFICATION.md`](DETECTOR_SPECIFICATION.md) for the full evidence contract
  every detector is held to.

## RO3 — Compare FLARE against existing tools on a controlled benchmark

**Claim:** detection-quality claims need a denominator.

**Implementation:**
- `contracts/benchmarks/flare-*/` — 40 fixture contracts (ten detectors × vulnerable / corrected
  / safe-negative / false-positive), each with a `ground-truth.json`.
- `services/analyzer/app/core/benchmark.py` — the runner that scores the full detector registry
  against every fixture and reports precision/recall; `evaluation/benchmark-result.json` is the
  generated (not hand-typed) output, currently 100% precision and 100% recall across all 40
  cases.
- `contracts/benchmarks/test/*.t.sol` — eight executable Foundry proofs, one for every
  `high`/`critical`-severity detector but one (see [`BENCHMARK_METHODOLOGY.md`](BENCHMARK_METHODOLOGY.md)
  for which and why), that the underlying fund-lock mechanisms actually happen — deposit,
  trigger, failed exit, remaining balance, unavailable recovery — not just that a static pattern
  matches.
- **Cross-tool comparison — done.** `evaluation/cross_tool/` runs Slither (CLI) and Mythril
  against a frozen 20-fixture subset and reports precision/recall/F1/runtime alongside FLARE's
  own numbers on the same subset — see [`evaluation/tool-mapping.md`](../evaluation/tool-mapping.md)
  for the full methodology (including two real, fixed installation/dependency conflicts found
  along the way) and [`evaluation/CROSS_TOOL_EVALUATION.md`](../evaluation/CROSS_TOOL_EVALUATION.md)
  for results. Securify 2.0 could not be run (Ubuntu 18.04 + Python 3.7 + a pinned old Soufflé
  release + solc 0.5.12 — none of which match this project's environment or fixture Solidity
  version); documented with the exact investigation, not silently skipped.
- **Independent holdout benchmark — done.** `contracts/holdout/` (10 independently-authored
  cases, 3 genuinely multi-contract, ground truth frozen before running) reports **100% recall,
  60% precision** — a real, disclosed gap from the dev set's 100%/100%, traced to one specific
  detector limitation (`FLARE-REC-001`) rather than left as a vague number. See
  [`evaluation/HOLDOUT_EVALUATION.md`](../evaluation/HOLDOUT_EVALUATION.md).

## RO4 — Ship a working prototype, not just a specification

**Claim:** a taxonomy and a benchmark plan are not evidence that an analysis pipeline works.

**Implementation:** the full pipeline is real and runnable — `services/analyzer` (FastAPI, inside
Docker/Python 3.12) implements intake → compile (solc-select) → Slither extraction → detector
execution → local Foundry/Anvil validation for two detector types → NetworkX fund-flow graph →
persisted result, all exercised by 51 passing tests (`services/analyzer/tests/`) and verified via
real HTTP requests against the running service (documented in commit messages, not just asserted
in prose). `apps/web` consumes this through a typed contract (`packages/schemas`,
`packages/graph`) matched field-for-field with the Python side (`CamelModel` alias generation —
see `services/analyzer/app/schemas/base.py`). See [`ARCHITECTURE.md`](ARCHITECTURE.md).

**Update:** the deterministic risk-scoring formula
(`FLARE_score = max(contribution) × coverage_multiplier`, documented in
[`RISK_METHODOLOGY.md`](RISK_METHODOLOGY.md), now v2.0.0) is wired into the live pipeline
(`app/core/scoring.py`) — a completed analysis reports a real score, band, and full per-finding
factor breakdown, with boundary/monotonicity/regression tests
(`services/analyzer/tests/test_scoring.py`). The frontend's `/app/analysis/new` now submits
directly to this live pipeline and `/app/analysis/[id]` renders the real result — verified via a
real upload → backend → result round trip (`tests/e2e/live-analysis.spec.ts`), not just unit
tests of each side in isolation. RO4 is now fully implemented as a working prototype end to end;
remaining gaps (RO3's cross-tool comparison, the independent holdout benchmark) are tracked
separately below and in [`LIMITATIONS.md`](LIMITATIONS.md).

## RO5 — Developer, governance, standards and insurance recommendations

**Claim:** evidence from ten detectors should inform recommendations beyond "run this tool."

**Implementation, by audience:**
- **Developers:** every finding's `remediation` field (see `services/analyzer/app/detectors/*.py`)
  is a concrete, pattern-specific fix, not generic advice — e.g. FLARE-XFER-002's remediation is
  "use a call()-based transfer with an explicit success check," not "be careful with transfers."
- **Governance (DAOs / protocol admins):** FLARE-LIB-001/002 and FLARE-REC-002's findings
  translate directly into pre-deployment checklist items — "does this dependency's setter have
  access control?", "does the pause mechanism exempt the recovery path?" — see
  [`docs/detectors`](../apps/web/content/docs/detectors.mdx) on the live site for the full list.
- **Standards:** FLARE-XFER-001/002 document two specific ways ERC-20-adjacent transfer code
  diverges from what a naive implementer assumes (non-reverting `false` returns; fixed-gas-
  stipend incompatibility with L2/proxy execution models) — concrete input for anyone drafting or
  reviewing a token-interaction standard.
- **Insurance:** the FLARE score's transparent, documented formula (severity × confidence ×
  reachability × recovery-offset, coverage-adjusted) is deliberately structured so an underwriter
  could audit *why* a score was assigned, not just consume a number — this is a design intent
  captured in [`RISK_METHODOLOGY.md`](RISK_METHODOLOGY.md); no insurance-specific integration
  exists yet, and none is claimed.
