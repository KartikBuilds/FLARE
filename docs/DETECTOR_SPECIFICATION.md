# Detector Specification

## What every detector must have before it ships

1. **Deterministic analysis logic** operating only on the normalized IR
   (`services/analyzer/app/schemas/ir.py`) — never on Slither's internal objects directly, and
   never on an LLM's output. Same input, same Slither version → same finding, every time.
2. **Exact source evidence** — a file, a line span, and the specific construct that triggered
   the finding (`services/analyzer/app/detectors/base.py::Detector._finding` requires a
   `FunctionIR.source` to build a `Finding`).
3. **A mapping to exactly one primary taxonomy category** (`packages/schemas/src/taxonomy.ts`).
4. **A vulnerable fixture** in `contracts/benchmarks/flare-<id>/vulnerable.sol` the detector
   correctly flags.
5. **A corrected counterpart** (`corrected.sol`) — the same contract with the specific issue
   fixed and nothing else changed — that the detector correctly does *not* flag.
6. **A safe negative control** (`safe-negative.sol`) — an unrelated, legitimately safe contract
   — that the detector also does not flag.
7. **A false-positive test** (`false-positive.sol`) — a contract superficially similar to the
   vulnerable pattern (same function names, similar shape) that isn't actually vulnerable, and
   the detector correctly ignores.

This is why the registry has ten detectors rather than a much larger, shallower list: each one
carries this full four-fixture burden, checked automatically by
`services/analyzer/tests/test_detectors.py::TestBenchmarkSuite`.

## The registry

| ID | Taxonomy | Severity | What it checks |
| --- | --- | --- | --- |
| `FLARE-LIB-001` | library-dependencies | critical | delegatecall target is a state variable with an unguarded setter |
| `FLARE-LIB-002` | library-dependencies | critical | a delegatecall dependency in the project has a reachable selfdestruct and no migration function |
| `FLARE-WD-001` | withdrawal-failures | high | a `require()` condition (`msg.sender == address(0)`) can never be satisfied |
| `FLARE-WD-002` | withdrawal-failures | high | a withdraw/redeem function's boolean guard is never set true by any function |
| `FLARE-REC-001` | missing-recovery | medium | the contract accepts value but has no rescue/sweep/recover function |
| `FLARE-REC-002` | missing-recovery | high | a pause modifier gates the contract's only recovery function too |
| `FLARE-STATE-001` | state-transitions | critical | a terminal enum state is reachable and every exit function excludes it, with assets able to enter |
| `FLARE-STATE-002` | state-transitions | high | a one-way state transition permanently disables a specific redemption function |
| `FLARE-XFER-001` | transfer-logic | high | an ERC-20-shaped `.transfer()`/`.transferFrom()` call's boolean return value is discarded |
| `FLARE-XFER-002` | transfer-logic | high | a native `.transfer()`/`.send()` (fixed ~2300 gas stipend) has no `call()`-based fallback |

Implementations: `services/analyzer/app/detectors/<name>.py`. Metadata/spec:
`packages/rules/src/detectors.ts` (this is the source both the Python implementation and the
`/docs/detectors` page on the live site are built against — not a generated mirror).

## Evidence extraction

Detectors don't parse Solidity themselves — they read structured signals
`services/analyzer/app/core/slither_service.py` extracts once per function:

- `requires: list[str]` — raw `require()`/`assert()` statement text.
- `assigns_to` / `assignment_statements` — which state variables a function writes, and the
  full `"var = value"` text (needed for state-transition detectors to know *which* value).
- `delegatecall_targets` — best-effort extraction of the receiver expression before
  `.delegatecall(`.
- `transfer_calls: list[TransferCallIR]` — every `.transfer()`/`.send()`/`.transferFrom()`
  call site, with `arg_count` (the discriminator between a native 1-argument ETH transfer and
  a 2–3-argument ERC-20-shaped call) and `is_checked` (wrapped in `require()`/`assert()`, or
  its result assigned to a variable).
- `is_enum` / `enum_values` on state variables, for the two state-transition detectors.

This extraction is a deliberate design choice: a substring/text scan on Slither's *rendered*
expression string is simpler and more stable across Slither versions than chasing its internal
call-graph attribute names. Getting it right required real debugging (documented in the
Milestone 6 commit): a constructor's initial state assignment was initially misread as a
"reverse transition," a transfer-checked heuristic read the wrong string offset, and
`.call{value: x}(...)` wasn't recognized as a low-level call because the call-options brace
syntax doesn't contain a bare `.call(`.

## Non-negotiables

- No detector may create a `Finding` without a concrete `FunctionIR.source` (file + line span).
- No detector calls an AI provider. The optional AI layer, when enabled, may only explain an
  *existing* finding — it cannot invent one.
- `validated: true` on a `Finding` means an executable Foundry/Anvil proof-of-concept confirmed
  it (`app/core/validation.py`) — currently scoped to `FLARE-WD-001`/`FLARE-WD-002`, where "call
  it immediately after deployment and confirm it reverts" is a valid test of the exact claim.
  It is never set from a static-only guess.
