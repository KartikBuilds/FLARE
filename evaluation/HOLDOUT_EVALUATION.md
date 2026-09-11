# Independent Holdout Benchmark — Results

**This is a genuinely separate evaluation from the 40-fixture dev set** — see
[`BENCHMARK_METHODOLOGY.md`](../docs/BENCHMARK_METHODOLOGY.md) for that one.
`evaluation/benchmark-result.json` and `evaluation/holdout-result.json` are never averaged or
combined into one headline number; they measure different things (a detector's own paired
fixtures vs. structurally-independent contracts nobody used while writing or tuning the
detectors).

## Result

```
docker compose run --rm analyzer python3 -m app.core.benchmark holdout \
  /srv/contracts/holdout /srv/evaluation/holdout-result.json
```

| Metric | Dev set (40 fixtures) | Holdout set (10 cases) |
| --- | --- | --- |
| Precision | 100% | **60%** |
| Recall | 100% | **100%** |
| True positives | 10 | 6 |
| True negatives | 30 | 0 |
| False positives | 0 | **4** |
| False negatives | 0 | 0 |

The holdout set's precision gap is real, disclosed, and — per the explicit instruction this
evaluation was built under — **not fixed by tuning the detectors afterward**. `contracts/
holdout/ground-truth.json` was written and frozen before this benchmark ran once against the
final, already-shipped detector registry (see its `_notice` field).

## What went right

All 6 vulnerable holdout cases were correctly flagged — including the 3 genuinely multi-contract
ones (a repointable-delegatecall registry split across two contracts, a bridge/relayer pair with
no fallback exit, and a wallet whose *library* — not the wallet itself — has an unprotected
`selfdestruct`). Recall staying at 100% on structurally different, independently-written
contracts is real evidence the ten detectors generalize beyond the exact shapes they were
authored against — not just the paper-thin patterns the dev-set fixtures use.

## What went wrong, and why (not glossed over)

All 4 safe-negative holdout controls were false-flagged. Investigated down to the exact firing
detector and root cause for each — this is the actual value of holdout testing:

### FLARE-REC-001 fired on all 4 safe cases — a real precision gap

`REC-001`'s implementation (`services/analyzer/app/detectors/rec_001_no_rescue_path.py`) flags
any contract that accepts value (a payable function, or an incoming `transferFrom`) *unless* it
has a function whose **name** matches `rescue|sweep|recover` (case-insensitive) — full stop. It
never checks whether the contract has an ordinary, always-reachable withdrawal function for the
asset it's actually designed to hold, only whether a specifically-named rescue-style function
exists. `GuardedVault.emergencyWithdraw()`, `SafeBridge.claimAfterTimeout()`,
`SafeTokenVault.withdrawToken()`, and `SimpleStaking.withdraw()` all provide a real, working exit
— none happen to match that specific name pattern, so all four were flagged anyway.

The dev-set's own REC-001 fixtures (`contracts/benchmarks/flare-rec-001/`) never exposed this,
because their `corrected.sol`/`safe-negative.sol` variants happen to *either* add a
rescue-pattern-named function *or* remove the payable entry point entirely — the "has a normal
differently-named withdraw function" case was never tested until this holdout set existed.
**This is the headline finding of the holdout benchmark**: a real, previously-unmeasured
precision gap, found by construction rather than claimed. Tracked as follow-up work in
[`LIMITATIONS.md`](../docs/LIMITATIONS.md) and [`DETECTOR_SPECIFICATION.md`](../docs/DETECTOR_SPECIFICATION.md)
— not fixed in this pass, since the ground truth was frozen specifically to prevent
after-the-fact tuning from manufacturing a clean number.

### FLARE-XFER-002 also fired on 3 of the 4 — expected, by its own documented scope

`XFER-002` flags any `.transfer()`/`.send()` (fixed 2300-gas-stipend) call, independent of
whether the specific bug it's paired against in the dev set is present — that's its whole,
narrowly-scoped point (fixed-gas-stipend transfers are a *portability* risk across L2s/proxies,
not something a single "safe" example can be free of just by fixing an unrelated bug). The
holdout safe fixtures reused `.transfer()` for convenience in places unrelated to the specific
detector category each was paired against (`holdout-03`'s pause bug, `holdout-02`'s bridge
single-point-of-failure) — so this is a limitation of *this holdout set's construction*, not a
detector defect: a safe fixture meant to be clean against **one** detector was not purpose-built
to be clean against **all ten** simultaneously. Distinguishing this from the REC-001 finding
above matters — conflating "expected, narrowly-scoped behavior" with "a real precision bug"
would be exactly the kind of imprecise reporting this document is trying to avoid.

## A real product bug, found and fixed during this evaluation

Three of the six vulnerable holdout cases are genuinely multi-file (multi-contract). The first
holdout run failed on all three with `"Registry.sol,VaultRouter.sol" does not exist. Are you in
the correct working directory?"` — tracing it down: crytic-compile's `solc` platform (used by
`services/analyzer/app/core/slither_service.py::run_slither`) only ever supported a single file
target; the comma-joined multi-file invocation the code assumed worked was never actually valid.
Fixed for this benchmark by analyzing each file independently and unioning findings
(`app/core/benchmark.py::run_holdout_case`) — correct for this holdout set's import-free
companion-contract pattern, but not a fix for genuine cross-file `import`-based Solidity
projects in the live pipeline, which remains a real, disclosed gap — see
[`LIMITATIONS.md`](../docs/LIMITATIONS.md).
