# Limitations

The canonical, most current version of this document. The narrative version on the live site
(`/docs/limitations`, `apps/web/content/docs/limitations.mdx`) links back here and should never
contradict it. Updated as the implementation changes — a limitation removed here means the
corresponding milestone shipped and was tested, not just described.

## Chain support

Only the EVM/Solidity analyzer is implemented. The Solana/Rust adapter is an interface-only
stub — see [`ARCHITECTURE.md`](ARCHITECTURE.md). The Lido-on-Solana case study is documentation
only; it cannot be reproduced by running the FLARE engine.

## No trained machine-learning model

No trained graph neural network or other learned model ships with this project. Detector logic
is deterministic, hand-specified rules over Slither's static-analysis output
(`services/analyzer/app/detectors/`). If a GNN is ever added, this file will say so only once it
has a documented training process and a reported evaluation.

## AI assistance

No code path currently calls an AI provider — the `AiProvider` abstraction described in the
original proposal (disabled / local model / user API key) has a settings surface in the
frontend (`apps/web/app/app/settings/page.tsx`) but no backend implementation yet. The full
pipeline runs identically either way, which is the point: AI, when it exists, will only explain
existing findings, never create them.

## Risk scoring: implemented (v2.0.0), with two documented gaps

[`RISK_METHODOLOGY.md`](RISK_METHODOLOGY.md) documents the complete FLARE-score formula, and
`services/analyzer/app/core/scoring.py` computes it on every real completed analysis —
`AnalysisSummary.flareScore`/`riskBand`/`scoreBreakdown` are populated, not `null`. Two things
remain honestly incomplete: (1) two of the six coverage-penalty conditions ("unresolved
external dependency interfaces", "external contracts referenced are unverified") have no
deterministic signal implemented yet, so they never fire — see `coverageNotes` on any analysis
result; (2) `recovery_offset`'s highest tier (0.6, "fully automated alternative verified
working") is unreachable by this implementation, since distinguishing "fully automated" from
"manual/governance-mediated" recovery isn't decidable from static analysis alone. Neither gap
silently inflates or deflates a score — the multiplier and offset are simply capped at what's
actually computed.

## Detector registry scope

Ten detectors, two per taxonomy category — see [`DETECTOR_SPECIFICATION.md`](DETECTOR_SPECIFICATION.md)
for why quality-per-detector (four required fixtures each) was prioritized over a larger,
shallower list. A contract free of findings from these ten detectors is not proven free of
every fund-lock risk — it means these ten specific, documented conditions were checked for and
not found. Detection is heuristic (pattern-matching over Slither's IR, not full symbolic
execution or formal verification) and can miss semantically equivalent code written
differently than the patterns it looks for.

## Validation adapter scope

`services/analyzer/app/core/validation.py` deploys the compiled contract to a local, throwaway
Anvil instance and calls the flagged function — but only for `FLARE-WD-001` and `FLARE-WD-002`,
where "call it immediately after deployment with default arguments and confirm it reverts" is a
valid, self-contained test of the exact claim. The other eight detector types are not validated
this way (some — like a missing rescue function — aren't naturally expressible as a single
revert check at all). A finding not marked `validated: true` is not thereby wrong; it simply
wasn't executable-proof-checked.

## A verified correction: selfdestruct's behavior changed under EIP-6780

`FLARE-LIB-002` models the Parity (2017) mechanism. Building its executable Foundry
demonstration (`contracts/benchmarks/test/LibraryDestructionLock.t.sol`) showed it no longer
reproduces as originally written: since Dencun (EIP-6780, March 2024), `selfdestruct` only
clears an account's code when called in the same transaction that created it. A
later-transaction `selfdestruct` — Parity's actual scenario — now only transfers the account's
ETH balance and leaves its code in place. Verified directly against Foundry's local EVM, not
assumed. The detector's *static* condition remains a legitimate design smell to flag; a fresh
full reproduction of the historical failure mode needs either the same-transaction case
EIP-6780 still allows, or a pre-Dencun chain.

## Case-study data

Five incidents in `research/incidents/`. "Perfect Finance" (2023) could not be independently
corroborated in public reporting as of this research and is marked `unverified` rather than
presented as fact. Dollar figures for verified incidents are approximate where they depend on
historical token price (most notably Parity, 2017) — the underlying token amount (513,774 ETH)
is reported as the primary verified fact.

## Benchmark scope

Forty fixtures validate each detector's specific condition, including adversarial
false-positive cases. This is not validation against the full diversity of real-world
Solidity, and — per RO3 in [`RESEARCH_ALIGNMENT.md`](RESEARCH_ALIGNMENT.md) — it is not yet a
side-by-side comparison against other static-analysis tools on the same fixtures.

## What "Foundry-verified" means, precisely

Two distinct things share the name and should not be confused:

1. **Fixture-level executable proofs** (`contracts/benchmarks/test/*.t.sol`) — prove a fund-lock
   *mechanism* is real, run manually / in CI, not tied to any specific live analysis.
2. **Per-finding validation** (`app/core/validation.py`) — runs as part of the live pipeline for
   eligible findings, sets `Finding.validated`.

Either way: always a local, offline Anvil execution. Never a live or forked mainnet state, and
never a public network — see `SECURITY.md`.

## Schema drift risk

TypeScript (`packages/schemas`) and Python (`services/analyzer/app/schemas/`) contracts are
kept in sync by hand, not by a codegen step — there are few enough fields that generating a
schema-sync tool would currently be more ceremony than the problem warrants. This is a known,
accepted risk: a future field added on one side without the other will not be caught until a
test or a live request fails. Revisit if the schema surface grows significantly.
