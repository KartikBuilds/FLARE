# RO3 Cross-Tool Evaluation — Methodology & Tool Mapping

This document is the methodology reference for `evaluation/CROSS_TOOL_EVALUATION.md`'s numbers.
Read this first — the numbers alone, without this context, invite exactly the kind of
apples-to-oranges comparison this project is committed to avoiding.

## What's being compared, and what isn't

FLARE's ten detectors target a specific, narrow class of bug: **can a legitimate holder's
assets become permanently stuck** (library dependency takeover, an unreachable withdrawal
branch, no rescue path, a one-way state transition, unchecked/incompatible transfer logic).
Slither and Mythril are general-purpose analyzers whose default detector/module sets are
overwhelmingly about *different* bug classes — reentrancy, integer issues (pre-0.8),
tx.origin misuse, unprotected selfdestruct, timestamp dependence, and so on. Neither ships a
detector whose stated purpose is "can this contract's assets get permanently stuck."

That means this evaluation cannot honestly ask "which tool finds fund-lock bugs best" — only
Slither, Mythril, and py-solc-x/Securify's own README would be needed to answer differently.
What it *can* honestly measure, and does:

1. **Did the tool flag anything at all** on each fixture in the frozen comparison set — a weak
   but fair, tool-agnostic signal of "did something about this file look wrong to this tool."
2. **Precision/recall/F1/false-positive rate** against that same weak signal — proves nothing
   about fund-lock detection specifically, only about each tool's general noisiness on these
   twenty small, purpose-built files.
3. **Runtime** — wall-clock seconds per fixture.
4. **Category coverage** (below) — a hand-reviewed judgment, not a computed metric, of whether
   each tool has *any* rule class that could ever catch each of FLARE's five taxonomy
   categories, independent of whether it fired on these specific fixtures.

## The frozen comparison subset

Twenty files: one `vulnerable.sol` and one `safe-negative.sol` per detector (10 detectors × 2).
`corrected.sol` and `false-positive.sol` are excluded — they're FLARE-detector-specific
adversarial variants (a `corrected.sol` differs from its `vulnerable.sol` sibling by exactly the
fix FLARE's own detector checks for; a generic tool with no matching detector has no reason to
tell the two apart, so including them would only manufacture a "high false-negative rate" that
reflects the comparison's unfairness, not the tool's quality). Selected and frozen before this
evaluation ran — see `evaluation/cross_tool/run_slither.py`/`run_mythril.py` for the exact file
list (identical in both).

## Tools attempted

| Tool | Version | Status | Notes |
| --- | --- | --- | --- |
| FLARE (own registry) | this repo | Ran | Existing dev-set benchmark run, filtered to the 20-file subset |
| Slither (CLI, not FLARE's own use of its API) | 0.10.4 | Ran | Own detector set, `--json` output |
| Mythril | 0.24.8 | Ran, with a fix | See below |
| Securify 2.0 | — (git, no release tag) | **Could not run** | See below |

### Mythril: a real installation issue, found and fixed

Installing `mythril` directly into `services/analyzer`'s image downgrades `web3`'s transitive
dependencies (`eth-abi`, `eth-hash`, `eth-keys`, `hexbytes`, `eth-typing`, `eth-utils`,
`eth-rlp`, `eth-keyfile`) to versions incompatible with `app/core/validation.py`'s Foundry/Anvil
integration — confirmed directly (`pip install mythril` inside the analyzer image, then
`docker compose run --rm analyzer pytest` would start failing on the validation tests). This is
why cross-tool evaluation runs in its own image (`evaluation/cross_tool/Dockerfile`) — never in
the analyzer's.

A second, distinct conflict: `mythril` and `slither-analyzer` cannot be installed *together*
either, even in a fresh, otherwise-empty image — confirmed directly (`docker compose build
cross-tool-eval` with both listed failed pip's resolver: `mythril 0.24.8 depends on
eth-hash<0.4.0 and >=0.3.1` while `slither-analyzer`'s own `web3`-compatible chain needs
`eth-hash>=0.5.1`, and no `eth-hash` version satisfies both). Fixed by not installing
slither-analyzer in `cross-tool-eval` at all — Slither already runs from the existing `analyzer`
image (`run_slither.py`), and Mythril runs alone in `cross-tool-eval` (`run_mythril.py`); the two
scripts never share a Python environment.

Even isolated, `myth version` initially failed:
```
File ".../eth/__init__.py", line 1, in <module>
    import pkg_resources
ModuleNotFoundError: No module named 'pkg_resources'
```
`mythril`'s `py-evm` dependency imports `pkg_resources` at import time; `setuptools >= 81`
stopped bundling it by default. Fixed by pinning `setuptools<81` alongside `mythril` — verified
this actually resolves it, not merely silences the symptom (`myth version` prints cleanly, and a
real analysis run below returns real findings).

A second issue: `myth analyze --solv 0.8.24` tries to download that solc binary from
`solc-bin.ethereum.org`, which does not resolve in this environment (`NameResolutionError`).
Fixed by omitting `--solv` entirely and instead activating solc 0.8.24 via `solc-select` (already
installed in the same image) before invoking `myth` — Mythril then uses the `solc` already on
`PATH` and never attempts a network fetch. This is the approach `run_tools.py` uses.

### Securify 2.0: could not run, and why

`securify` is not published on PyPI (`pip index versions securify` → "No matching distribution
found"). Cloned `github.com/eth-sri/securify2` directly (network-reachable, confirmed) and
inspected its actual `Dockerfile` and `README.md`. It requires:

- **Ubuntu 18.04** as the base OS (its own `Dockerfile` is `FROM ubuntu:18.04`)
- **Python 3.7** specifically, in its own virtualenv
- **Souffle 1.6.2** (a specific old release of the Soufflé Datalog compiler), installed from a
  pinned `.deb` release asset
- A native compilation step (`compile_functors.sh`) against that Soufflé version
- **solc 0.5.12**, hardcoded — the tool's own analysis rules target that compiler era

None of this matches this project's Python 3.12 / current-Ubuntu-base environment, and even a
successful from-scratch install would analyze bytecode from a `solc 0.5.12` compile — a
different compiler generation than the `^0.8.24` fixtures this evaluation and the rest of the
repository use, so its results wouldn't be comparable to FLARE's or Mythril's even if it ran.
Building and maintaining a second, isolated legacy (Ubuntu 18.04 + Python 3.7 + Souffle 1.6.2)
image for one unmaintained tool (Securify 2.0's last substantive commits predate this project by
several years) was judged disproportionate to what it would add — this is a documented,
reproducible decision, not an unexplained gap. Reproduce the investigation with:
```
git clone https://github.com/eth-sri/securify2.git
cat securify2/Dockerfile securify2/README.md
```

## Category coverage (hand-reviewed, not computed)

Does the tool have *any* rule class that could plausibly ever catch each FLARE taxonomy
category, independent of these specific fixtures?

| Category | Slither | Mythril |
| --- | --- | --- |
| Library Dependencies | Partial — `controlled-delegatecall` detector exists | Partial — SWC-112 (delegatecall to user-supplied address) |
| Withdrawal Failures | No dedicated detector | No dedicated detector |
| Missing Recovery | No dedicated detector | No dedicated detector |
| State Transitions | No dedicated detector | No dedicated detector |
| Transfer Logic | Partial — `unchecked-transfer` detector exists | Partial — SWC-104 (unchecked call return value) |

Three of five categories (Withdrawal Failures, Missing Recovery, State Transitions) have no
plausible match in either tool's rule set at all — this is the honest headline finding of RO3:
not "FLARE is more/less accurate," but that most of FLARE's taxonomy targets a bug class neither
general-purpose tool's detector set addresses.
