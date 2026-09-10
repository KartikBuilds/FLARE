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

## What this benchmark does not claim

Forty fixtures across ten detectors validate that each detector's specific, documented
condition behaves correctly, including against adversarial "looks similar but isn't" cases —
not that FLARE has been validated against the full diversity of real-world Solidity. It is also
not a comparison against other static-analysis tools run on the same fixtures — see RO3 in
[`RESEARCH_ALIGNMENT.md`](RESEARCH_ALIGNMENT.md) for that acknowledged gap.
