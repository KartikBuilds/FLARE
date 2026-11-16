# FLARE Product Design (reset, 2026-11-16)

Status: **Approved 2026-11-16** (owner delegated full authority to the engineering lead). Replaces the product sections of the old
README and every earlier decision (D-001 to D-010 and D-01 to D-10). The README's
principles (§1.5), research objectives (§2.1) and benchmark method (§9.7) stay in force.
Calls marked **[engineering call]** were made by the engineering lead under the owner's
delegation and can be overridden.

## 1. Intent

FLARE answers one question for a Solidity developer: **"Can funds get permanently stuck
in this contract, and where?"** Today a developer runs Slither and gets 40+ generic
warnings, of which at most one detector (`locked-ether`) is about fund-lock. FLARE gives a
focused fund-lock report instead:

- only findings relevant to fund-lock, grouped by the five categories;
- FLARE's own detectors for patterns Slither does not cover, each traced to a real
  incident;
- for every finding: the code location, the evidence, why funds get stuck, and what to
  change;
- an explicit list of what was not checked.

It is also the research instrument for the MRP: the same engine produces the benchmark
(RO3, RO4) and the prevention guidance (RO5).

**Why now:** MRP and Capstone, final deadline 31 March 2027 (Capstone internal target
31 January 2027).

## 2. Goals, non-goals, anti-goals

**Goals**
1. Detect fund-lock patterns in single-file or small multi-file Solidity projects.
2. Ship custom detectors covering all five categories, each with test contracts.
3. A reproducible benchmark comparing FLARE with Slither, Aderyn, Mythril and Securify
   (where installable) on a frozen, labeled corpus.
4. A working demo usable by an evaluator in a browser.

**Non-goals (MVP):** Vyper, Solana or Rust analysis, address lookup, user accounts, scan
history, monitoring deployed contracts, general exploit detection, mobile app, Redis or
queue infrastructure.

**Anti-goals (failure even if it "works")**
- Any mock, sample or hand-entered finding or metric shown as real.
- A low score read as "safe". Every report states that FLARE is not an audit.
- Benchmark numbers produced by detectors tuned on the test corpus (see §6).
- Submitted source stored, logged or returned beyond the scan.

## 3. Approaches considered

| Approach | Trade-off | Decision |
|---|---|---|
| A. Classify output of existing analyzers only | Cheapest; output near-empty because stock analyzers barely cover fund-lock | Rejected |
| B. Custom fund-lock detectors as a Slither plugin + mapping of relevant built-in detectors + classification | Real value over Slither; moderate effort; inherits Slither's AGPL | **Chosen [engineering call]** |
| C. Own analysis engine (AST/symbolic) | Most control; far beyond one person by March 2027 | Rejected |

Evidence: Slither offers a Python detector API, and third-party detector packs
(e.g. Slitherin) plug into it.

## 4. Product decisions

### 4.1 Detection engine
- Slither (pinned version) is the analysis host. FLARE detectors are Python classes using
  Slither's detector API, packaged as a Slither plugin.
- Built-in detectors are kept only if mapped to a category in a versioned mapping file
  (starting with `locked-ether`; others added only with a written justification).
- Aderyn: benchmark comparison only, not in the product path **[engineering call]**.
  Mythril and Securify: benchmark only, if installable.
- Compiler: `solc-select`, version taken from the source's pragma. An unsupported pragma
  yields a clear error, never a silent default.

### 4.2 Taxonomy with a tie-break rule
The five categories stay (promised in the proposal). Each finding gets exactly one primary
category, chosen by **root cause, in this precedence** **[engineering call]**:

1. **Library Dependencies:** the lock originates in an external or library contract
   (e.g. a delegatecall target that can self-destruct or be killed).
2. **State Transitions:** a state change leads to a state with no valid exit.
3. **Transfer Logic:** asset transfer or token-interface handling makes funds
   unreachable (e.g. tokens sent to an address that cannot move them).
4. **Withdrawal Failures:** a withdrawal path exists but can fail persistently.
5. **Missing Recovery:** the contract can receive assets but has no withdrawal or
   rescue path at all (covers `locked-ether`).

If two categories fit, the higher one wins and the other is recorded as secondary. If none
fits, the finding is shown as **Unclassified**, never forced.

### 4.3 Detectors (initial set, one or more per category)
Each detector ships with: positive and negative test contracts, a pattern description, the
incident or published pattern it derives from, and a recommendation. Initial targets
(final list fixed in the plan, after incident verification):

| Category | Example pattern |
|---|---|
| Library Dependencies | Funds rely on `delegatecall` into a contract that can be destroyed or re-initialized (Parity pattern) |
| State Transitions | A state flag or enum can reach a value from which no function allows withdrawal |
| Transfer Logic | Token transfer whose return value is ignored while accounting is updated; ETH sent with `transfer` to a contract that cannot receive |
| Withdrawal Failures | Withdrawal loops over an unbounded array, or one failing recipient blocks everyone |
| Missing Recovery | Payable or token-receiving contract with no path that sends assets out |

### 4.4 Risk summary
- Each finding carries a severity (Critical, High, Medium, Low) set per detector and
  justified in its documentation.
- **Overall level = the highest severity present** with the category breakdown beside it.
  No 0–100 score in the MVP **[engineering call]**: a single number implies a precision
  five incidents cannot support. (The PRD's 0–100 score is deferred; it can be added once
  the benchmark exists.)
- A scan with a failed or timed-out analyzer reports **Incomplete**, never a level.

### 4.5 Interfaces
1. **CLI (first):** `flare scan <file-or-dir> --format json|html|md`. This is the research
   and CI interface.
2. **Web demo (later):** paste or upload `.sol`, view the report, download it. A thin
   FastAPI service over the same engine plus a simple frontend.
3. **Report:** HTML and Markdown in the MVP; PDF only if time allows (print-to-PDF from
   HTML covers the Capstone need).

### 4.6 Architecture and deployment
- **Local-first engine; hosted demo last** **[engineering call]**. The CLI and engine run
  locally with no network. The Capstone requires live deployment, so the final phase adds
  a hosted demo: a containerized web app on a free tier, running each scan in a
  sandboxed process with a 30 s timeout, no network, size limits (500 KB, 3,000 lines),
  rate limiting, and no storage of source.
- If a safe free-tier host cannot run Slither and solc within those limits, the fallback is
  a recorded demo plus local install instructions. This is decided in that phase with
  evidence.

### 4.7 Licensing
FLARE detectors import Slither (AGPL-3.0), so **FLARE is licensed AGPL-3.0**
**[engineering call, not legal advice]**. A hosted demo must then offer its source,
which the public GitHub repo satisfies.

### 4.8 Privacy
Source exists only in a per-scan temporary directory, deleted on every exit path. Logs
hold request ID, timings, status and sizes only. Tests prove this (carried over from the
README §11).

## 4.9 Input scope [engineering call]
- MVP input: **one Solidity file**, or a **flattened** project (all imports inlined), up to
  500 KB and 3,000 lines. Unresolved imports return a clear `UNRESOLVED_IMPORT` error that
  tells the user to flatten (e.g. `forge flatten`).
- Solidity `>=0.4.24` (versions `solc-select` can install). The pragma picks the compiler.
- The engine always forces the plain `solc` compile framework so stray project files cannot
  change how a scan compiles (seen in the spike).

## 4.10 Success targets (targets until measured on the frozen test set)
| Metric | Target |
|---|---|
| Recall on labeled vulnerable contracts, per category | ≥ 80% |
| False-alarm rate on labeled safe look-alikes and clean controls | ≤ 20% |
| Incident contracts with Solidity source where FLARE flags the right category | all of them, with any miss explained |
| Scans completing (or failing clearly) within 30 s for ≤ 500-line inputs | ≥ 95% |
| Findings whose explanation names line, pattern, incident, and fix | 100% |

## 4.11 Spike evidence (2026-11-16, throwaway code, not kept)
- Slither 0.11.6, solc 0.8.24, Python 3.11. A custom detector written against Slither's
  detector API (`AbstractDetector`, SlithIR `LowLevelCall`) ran end to end.
- Parity-pattern wallet (holds ETH, logic via `delegatecall` to a mutable address):
  **1 of 1 flagged**. Two safe look-alikes (a vault with its own withdrawal; a
  delegatecall router that cannot hold ETH): **0 false alarms**.
- Stock Slither, all detectors, on the same wallet: `controlled-delegatecall`,
  `immutable-states`, `low-level-calls`, `missing-zero-check`, `naming-convention`. None
  of these says funds can get stuck. This is the gap FLARE fills.
- Research note to verify: since the Cancun upgrade (EIP-6780), `selfdestruct` no longer
  deletes deployed code in most cases, so the exact 2017 Parity "library killed" path is
  largely closed on Ethereum mainnet. The broader pattern (funds depending on mutable
  external code) still applies. The taxonomy write-up must say so.

## 5. Research workflow (parallel to engineering)
1. **Verify incidents first.** For each of the five, record primary sources, chain,
   address, source availability, root cause and amount. Lido stSOL (Solana) stays a
   **case study only**. It is not in the detection benchmark because FLARE does not scan
   Solana.
2. **Derive patterns** from verified root causes. These feed §4.3.
3. **Build the corpus** (frozen before final tuning):
   - real incident contracts with available Solidity source;
   - per category, small labeled contracts: at least 3 vulnerable and 3 safe look-alikes;
   - a negative control set of well-known clean contracts (e.g. OpenZeppelin examples).
4. **Benchmark:** unit of analysis = **(contract, category) pair**, labeled present or absent.
   Precision and recall are reported per tool with sample sizes and limitations.

## 6. Benchmark integrity rule
Detectors are developed against a **development set**. The **test set** (held-out labeled
contracts plus all real incident contracts) is frozen and hashed before final detector
tuning and is not used to adjust detectors. Results on the development set are reported
separately and labeled as such.

## 7. Constraints
- One developer, zero budget, deadline 31 Mar 2027 (Capstone internal 31 Jan 2027).
- Python 3.11, pinned dependencies, GitHub Actions CI.
- Capstone: ten Agile/SDLC diagrams per the coordinator's rubric (still to be obtained),
  and live deployment evidence.

## 8. Phases (replace README §8)
| Phase | Delivers | Exit evidence |
|---|---|---|
| 0 | Repo reset, this design, AGPL license, CI skeleton | CI green on an empty test |
| 1 | Engine core: input validation, solc selection, Slither run with timeout, normalized findings, Incomplete handling | Tests on fixture contracts |
| 2 | Taxonomy + first detector per category + mapping file + report (JSON/MD/HTML) | Each detector passes its positive and negative tests |
| R (parallel) | Incident verification, patterns, corpus, frozen test set | Evidence files with sources |
| 3 | Full detector set + benchmark harness + results | Reproducible run from a clean checkout |
| 4 | Web demo (API + UI) with privacy, limits, rate limiting | Privacy and limit tests; UI review (ui-ux-pro-max) |
| 5 | Hosted deployment + security review (gstack cso) + Capstone docs | Live URL or documented fallback; release gates pass |

## 9. Left to the builder
- Exact detector logic, test contract contents, report layout, CLI flag details.
- Pinned versions (latest stable at the time of install).

## 10. Open items needing the owner
1. College Capstone rubric (the ten diagrams).
2. ~~AGPL-3.0~~ accepted under delegation.
3. ~~Reset~~ done 2026-11-16.
