# Risk Methodology

> **Status:** this formula is fully specified and is the contract any future scoring
> implementation must match. It is **not yet wired into the live pipeline** —
> `services/analyzer`'s `AnalysisSummary.flareScore` is `null` on every real analysis today. See
> [`LIMITATIONS.md`](LIMITATIONS.md). The full narrative version, with a worked example, lives
> at `/docs/risk-methodology` on the live site (`apps/web/content/docs/risk-methodology.mdx`).

The FLARE score is a number from 0–100 computed by a fixed, published formula — the same
findings and the same coverage inputs always produce the same score. No step is delegated to a
language model.

## Per-finding contribution

```
contribution = severity_weight[severity] × confidence × reachability × (1 − recovery_offset)
```

**Severity weight:** critical=100, high=70, medium=40, low=15.

**Confidence** (0.0–1.0): the detector's own confidence. A finding backed by a passing Foundry
proof-of-concept is floored at 0.9; a static-only finding with no dynamic validation is capped
at 0.75.

**Reachability** (0.0–1.0): public=1.0 (any unauthenticated caller), privileged=0.7
(admin/owner-gated only), theoretical=0.4 (no concrete call path found).

**Recovery offset** (0.0–0.6): reduces the contribution when a *different*, verified-working
recovery path exists for the same assets elsewhere in the contract — none=0.0,
manual/governance-mediated=0.3, fully automated alternative=0.6.

## Overall score

```
FLARE_score = max(contribution across all findings) × coverage_multiplier
```

The **maximum**, not a sum — stacking many low-severity findings should not fake a critical
score. `coverage_multiplier` starts at 1.0 and is reduced when the analysis itself was
incomplete:

| Condition | Penalty |
| --- | --- |
| Source could not be fully resolved (missing imports) | −0.15 |
| Compilation failed entirely (heuristic-only fallback) | −0.30 |
| Unresolved external dependency interfaces | −0.10 |
| Inline assembly/Yul present and not analyzed | −0.10 |
| External contracts referenced are unverified | −0.05 |
| No Foundry/Anvil dynamic validation performed at all | −0.10 |

`coverage_multiplier` is floored at 0.5 and surfaced in the UI as the analysis's
confidence/coverage figure — one honest number, not two similar-looking ones that could
disagree.

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
