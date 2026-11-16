# How FLARE is built: departments, roles, models and gates

Each department is a real Claude Code agent in `.claude/agents/<department>.md` with its
own model, allowed tools, checklist (the role titles) and one output file. Departments
hand work to each other **through files**, never through chat memory.

## Phase order (README §8, owner's locked order) and who does what

| Phase | Lead (builder) | Model | Gate (independent reviewer) | Model | Machine checks |
|---|---|---|---|---|---|
| Every phase start | product-business-analysis | opus | architecture | fable (fallback opus) | — |
| 1 Backend foundation | core-development | opus | qa-security-validation | fable re-review | CI |
| 2 Core analysis engine | core-development (+ research-security-intelligence) | opus | qa-security-validation | fable | CI, detector test corpus |
| 3 Security & reliability | core-development + devops-maintenance | sonnet | qa-security-validation | opus | CI, finecomb; gstack cso on owner's Mac |
| 4 Backend integration | core-development | sonnet | qa-security-validation | opus | CI; gstack codex on owner's Mac |
| 5 Frontend | ui-ux-design → core-development | sonnet | qa-security-validation | opus | CI, Playwright |
| 6 Verification & release | devops-maintenance + academic-research-docs | sonnet | qa-security-validation + academic-research-docs | fable | CI, gstack cso |
| Research (parallel) | research-security-intelligence | opus | academic-research-docs | fable | source links checked |

Chores (dependency bumps, CI log triage, formatting): devops-maintenance on haiku.

## Rules that make the setup trustworthy

1. **Builder ≠ reviewer model.** The reviewer runs on a different model than the builder.
   If the planned model is unavailable, the gate file says which model ran instead.
2. **Reviewers cannot edit code.** Their agent definitions omit the Edit tool.
3. **At least one machine check per gate** (tests/CI, finecomb, Playwright).
4. **Merges are blocked by CI** unless `docs/reviews/<branch>-gate.md` says `Verdict: PASS`
   with a `Reviewer:` line (`scripts/check_gate.py`).
5. **Unsafe git is blocked by a hook** (`.claude/hooks/guard.py`): no commits on main,
   no pushes to main, no force pushes.
6. **Owner approves three things:** the spec, each merge, and every research claim, which
   the owner must be able to explain (the MRP is assessed as the owner's work).

## Handoff files

| From | Writes | Read by |
|---|---|---|
| research-security-intelligence | `research/incidents/*.md`, `research/patterns.md` | product, core-development, academic |
| product-business-analysis | `docs/superpowers/specs/*`, `docs/superpowers/plans/*` | architecture, core-development |
| architecture | `docs/reviews/<branch>-architecture.md` | core-development |
| ui-ux-design | `docs/design/<phase>-ui.md` | core-development |
| core-development | code, tests, `.superpowers/sdd/<plan>/progress.md` | qa |
| qa-security-validation | `docs/reviews/<branch>-gate.md` | owner (merge), devops (deferred minors) |
| academic-research-docs | `docs/reviews/<branch>-research.md`, benchmark reports | owner |

## Gate effectiveness log

A gate that finds nothing for two phases is either redundant or too weak: tighten its
checklist or seed a known bug and confirm it is caught.

| Phase | Gate | Model | Critical | Important | Minor | Notes |
|---|---|---|---|---|---|---|
| 0–1 | qa-security-validation | opus (fresh context) | 0 | 3 | 6 | Source leak in compile errors, no compile reason, false clean on missing detector. All 3 fixed with RED→GREEN tests. |
