# Risk Methodology

> **Status:** wired into the live pipeline as of formula v2.0.0 —
> `services/analyzer/app/core/scoring.py`. `AnalysisSummary.flareScore` is populated on every
> real completed analysis. The full narrative version, with a worked example, lives at
> `/docs/risk-methodology` on the live site (`apps/web/content/docs/risk-methodology.mdx`).

The FLARE score is a number from 0–100 computed by a fixed, published, versioned formula — the
same findings and the same coverage inputs always produce the same score. No step is delegated
to a language model, and the score is never presented as a probability or an AI judgment —
it's a deterministic function of concrete evidence, reported alongside a full per-finding
factor breakdown (`AnalysisSummary.scoreBreakdown`) so *why* a score is what it is is always
visible, not just the final number.

## Changelog

**v2.0.0** (this implementation) extends v1 (the original draft spec) with two more factors —
`asset_exposure` and `dependency_criticality` — and makes one deliberate, documented deviation
from the v1 draft text:

- The v1 draft capped a static-only (non-dynamically-validated) finding's confidence at 0.75.
  **This cap was dropped in the implementation.** Detector-declared confidence is already a
  calibrated, per-pattern value (e.g. an exact unsatisfiable-condition regex match is not
  meaningfully less certain just because no Foundry proof was attempted for that detector
  *type*) — a blanket cap would discard real signal without adding accuracy. The
  validated-floor (confidence ≥ 0.9 once `Finding.validated` is `True`, applied in
  `app/core/validation.py`) is kept, since dynamic proof is strictly additional evidence on top
  of whatever static confidence was already assigned.
- `recovery_offset`'s 0.6 ("fully automated alternative") tier is specified but never reached by
  this implementation — there's no deterministic way to distinguish "fully automated" from
  "manual/governance-mediated" alternative recovery from static analysis alone, so the computed
  offset is capped at 0.3 (`app/core/scoring.py::recovery_offset_for`).
- Two coverage-penalty rows from the original table ("unresolved external dependency
  interfaces", "external contracts referenced are unverified") are specified but **not yet
  computed** — no reliable deterministic signal for either exists yet. They're listed as
  not-yet-computed in every analysis's `coverageNotes`, never silently treated as "checked and
  passed".

## Per-finding contribution

```
contribution = severity_weight[severity] × confidence × reachability_weight
             × asset_exposure × dependency_criticality × (1 − recovery_offset)
```

**Severity weight:** critical=100, high=70, medium=40, low=15.

**Confidence** (0.0–1.0): the detector's own declared confidence, raised to at least 0.9 once a
finding is executable-proof validated (`Finding.validated`). See the v2 changelog above for why
there is no separate cap for unvalidated findings.

**Reachability** (`Finding.reachability`, set per-finding at detection time —
`app/detectors/base.py::reachability_for`): a deterministic heuristic over the flagged
function's visibility and modifier *names* — public=1.0 (external/public, no access-control-
shaped modifier), privileged=0.7 (external/public but guarded by a modifier matching
only.../auth.../admin.../owner.../restrict.../guard...), theoretical=0.4 (internal/private —
not directly externally callable). This is a heuristic, not a full access-control analysis —
see [`LIMITATIONS.md`](LIMITATIONS.md).

**Asset exposure** (0.0–1.0, new in v2): derived from the finding's node in the fund-flow graph
(`app/core/graph.py`) — 1.0 for an entry/exit/blocked node (a real fund path), 0.6 for an
internal/constructor node still reachable from the graph, 0.3 when the finding's location
couldn't be matched to any graph node at all.

**Dependency criticality** (0.0–1.0, new in v2): 1.0 for a `library-dependencies` taxonomy
finding, 0.6 for `state-transitions`/`missing-recovery`, 0.3 otherwise
(`app/core/scoring.py::dependency_criticality_for`).

**Recovery offset** (0.0–0.3 in this implementation; 0.6 specified but unreached — see
changelog): 0.3 when a genuinely *different*, non-blocked "exit"-role node exists elsewhere in
the same contract; 0.0 for `missing-recovery` findings by definition, and 0.0 whenever the only
candidate "alternative" is the finding's own node.

## Overall score

```
FLARE_score = max(contribution across all findings) × coverage_multiplier
```

The **maximum**, not a sum — stacking many low-severity findings should not fake a critical
score. `coverage_multiplier` starts at 1.0 and is reduced when the analysis itself was
incomplete (`app/core/scoring.py::compute_coverage`):

| Condition | Penalty | Status |
| --- | --- | --- |
| Source could not be fully resolved (missing imports) | −0.15 | Implemented — text-matched against `ProjectIR.compile_warnings` |
| Compilation failed entirely (heuristic-only fallback) | −0.30 | Structurally unreachable: a failed compile raises `CompileError` and the pipeline never reaches the `SCORING` stage at all — see `app/core/pipeline.py` |
| Unresolved external dependency interfaces | −0.10 | Not yet computed — no deterministic signal implemented |
| Inline assembly/Yul present and not analyzed | −0.10 | Implemented — regex-matched against the analyzed source files |
| External contracts referenced are unverified | −0.05 | Not yet computed — no deterministic signal implemented |
| No Foundry/Anvil dynamic validation performed at all | −0.10 | Implemented — applied when the analysis has findings but none are `validated` |

`coverage_multiplier` is floored at 0.5 and surfaced in the UI as the analysis's
confidence/coverage figure, alongside `coverageNotes` — the specific reasons behind whatever
the number is, including which penalty rows aren't computed yet — one honest number plus its
reasoning, not two similar-looking figures that could disagree.

## Risk bands

| Score | Band |
| --- | --- |
| 80–100 | Critical |
| 60–79 | High |
| 35–59 | Medium |
| 15–34 | Low |
| 0–14 | Minimal |

## Reduced confidence triggers

Per the coverage-penalty table above, confidence is reduced (never silently ignored) when:
source is incomplete, compilation fails, dependencies are unresolved, assembly is present and
unsupported, external contracts are unverified, or no dynamic validation was performed.
