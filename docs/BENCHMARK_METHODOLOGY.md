# Benchmark Methodology

## Fixture structure

Each of the ten registry detectors ships exactly four fixtures in
`contracts/benchmarks/flare-<id>/`:

1. **`vulnerable.sol`** — the minimal contract that triggers the detector.
2. **`corrected.sol`** — the same contract, issue fixed, nothing else changed; must *not* fire.
3. **`safe-negative.sol`** — an unrelated, legitimately safe contract; guards against a
   detector that fires too broadly.
4. **`false-positive.sol`** — superficially similar to the vulnerable pattern but not actually
   vulnerable; the fixture most likely to catch an overly aggressive detector.

40 fixtures total (10 × 4), each with a `ground-truth.json` recording the expected finding (or
explicitly, the expected absence of one) and a short explanation a reviewer can check by hand.

## Scoring

`services/analyzer/app/core/benchmark.py::run_benchmark` compiles and analyzes every fixture,
runs the full detector registry, and checks — per detector, per fixture — whether the expected
outcome matches:

- **Precision** = true positives / (true positives + false positives)
- **Recall** = true positives / (true positives + false negatives)

Run it:

```bash
docker compose run --rm analyzer python3 -m app.core.benchmark \
  /srv/contracts/benchmarks /srv/evaluation/benchmark-result.json
```

Results are written to `evaluation/benchmark-result.json` — a generated file, never hand-typed
— and the dashboard's "Recent Benchmark Result" card
(`apps/web/components/dashboard/StatusCards.tsx::BenchmarkResultCard`) reads it directly. As of
the last generated run: **100% precision, 100% recall, 40/40 cases correct.**

`services/analyzer/tests/test_detectors.py::TestBenchmarkSuite` asserts this in CI — a shipped
detector with any known failure against its own fixtures fails the test suite, not just the
benchmark report.

## Executable proofs (Foundry)

Three of the ten mechanisms also have standalone, executable Foundry demonstrations in
`contracts/benchmarks/src/demos/` + `contracts/benchmarks/test/`:

- `LibraryDestructionLock.t.sol` — a delegatecall dependency's selfdestruct.
- `TerminalStateLock.t.sol` — a terminal enum state with no exit.
- `FixedGasStipendLock.t.sol` — a `.transfer()` failing against a gas-hungry receiver.

Building the first of these surfaced a genuine, verified research finding: since the Dencun
upgrade (EIP-6780, March 2024), `selfdestruct` only clears an account's code when called in the
*same transaction* that created it — a later-transaction `selfdestruct` (Parity's actual
scenario) now only moves the account's ETH balance and leaves its code in place. The test
documents this directly (`test_postCancunSelfdestructNoLongerClearsCodeAcrossTransactions`)
rather than asserting something false or quietly deleting the demo.

Run them:

```bash
docker compose run --rm -w /srv/contracts/benchmarks analyzer forge test
```

## Independent holdout benchmark

The 40 fixtures above are the *development set* — written alongside, and used while tuning, the
detectors they test. `contracts/holdout/` is a separate, independently-authored 10-case set
(6 vulnerable including 3 genuinely multi-contract cases, 4 paired safe negatives), with its
ground truth (`contracts/holdout/ground-truth.json`) frozen **before** running the registry
against it — no detector logic changed afterward based on the result. Run it:

```bash
docker compose run --rm analyzer python3 -m app.core.benchmark holdout \
  /srv/contracts/holdout /srv/evaluation/holdout-result.json
```

Dev-set and holdout-set results are **never averaged or combined** — they're reported side by
side because they measure different things. Full results, root-cause analysis of every
discrepancy, and a real bug this evaluation found and fixed (multi-file Slither analysis) are in
[`evaluation/HOLDOUT_EVALUATION.md`](../evaluation/HOLDOUT_EVALUATION.md) — headline: **100%
recall, 60% precision** on holdout vs. 100%/100% on the dev set, with the precision gap traced
to one specific, named detector limitation (`FLARE-REC-001` — see
[`DETECTOR_SPECIFICATION.md`](DETECTOR_SPECIFICATION.md)), not a vague "some false positives."

## Cross-tool comparison (RO3)

`evaluation/cross_tool/` runs Slither (CLI) and Mythril against a frozen 20-fixture subset of
the dev set and reports precision/recall/F1/runtime alongside FLARE's own numbers on the same
subset — see [`evaluation/tool-mapping.md`](../evaluation/tool-mapping.md) for the full
methodology (including why Securify 2.0 could not be run, and what this comparison does and
doesn't prove) and [`evaluation/CROSS_TOOL_EVALUATION.md`](../evaluation/CROSS_TOOL_EVALUATION.md)
for results.

## What this benchmark does not claim

Forty dev-set fixtures across ten detectors validate that each detector's specific, documented
condition behaves correctly, including against adversarial "looks similar but isn't" cases —
not that FLARE has been validated against the full diversity of real-world Solidity (the
holdout set above is a first, partial step in that direction, not a complete answer). It also
does not claim to out-detect general-purpose tools at their own strengths — see the cross-tool
comparison above for exactly what is and isn't measured there.
