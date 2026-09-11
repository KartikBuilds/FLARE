# FLARE UI Redesign — Report

This covers the frontend redesign pass against the four reference images
(`design/references/0{1-4}_*_reference_HQ_3x.png`), commits `8121e8e` through
`f35d4d3`. It is a status report, not a completion claim: it says exactly
what changed, what was verified, and what a further pass still needs to
cover to reach full reference parity on every route. Backend, analyzer,
schemas, API, security posture, and the existing test suite were not
touched except where a fix required a new regression test.

## Method

For each of the four reference pages: screenshot the live site at desktop
width, read it side-by-side with the reference image, identify the specific,
concrete visual gap (not a general impression), fix it, re-screenshot,
re-verify at 1440/768/390/320px with both a visual check and a
`document.documentElement.scrollWidth` measurement, run the full offline
Playwright suite plus typecheck/lint, then commit and push. Findings below
are what was actually measured, not assumed from the original redesign
brief's general description of the gap.

## What was found and fixed

### 1. Real bug: SSR-opacity hiding above-the-fold content (`8121e8e`)

Investigating an apparently-empty Taxonomy section on the home page led to a
confirmed, non-cosmetic bug: Motion applies a component's `initial` prop as
a synchronous inline style during Next.js SSR, so every `initial={{ opacity:
0 }}` above-the-fold element — the hero headline/copy/CTAs/machine diagram,
the pipeline stage icons and detail panel, all five taxonomy cards — shipped
`style="opacity:0"` in the raw server-rendered HTML. Confirmed directly with
`curl` against the SSR response, not inferred. Fixed by removing `opacity`
from every affected Motion prop (translate-only reveals instead) and adding
`tests/e2e/ssr-visibility.spec.ts` as a standing regression test against the
raw HTML response. Verified with JavaScript fully disabled that the hero
heading, all 5 taxonomy cards, and all 9 pipeline modules render visible at
1440/768/390/320px.

### 2. Home hero composition (`06cb562`)

Against `01_home_reference_HQ_3x.png`: the hero's illustrations (coin,
protocol core, intake/vault/exit machine) were correct in content but
rendered small in wide empty margins, instead of one connected full-width
composition. Rebuilt without adding new illustration assets: corner
illustrations enlarged and bled toward the true edges; the two exit pipes
changed from small fixed-width icons next to a text column into real
full-width `PipeSegment` runs (`preserveAspectRatio="none"`); vault module
enlarged. Also found and fixed a real, unrelated bug while verifying this at
every breakpoint: `PipelineSection`'s stage tablist switched from a
scrollable strip to `overflow-visible` at `sm` (640px) even though the 9
stage icons don't fit without clipping until `lg` (1024px) — 154px/46px of
real page overflow at 640/768px before the fix, 0px after.

### 3. Dashboard closing scene (`1546aa5`)

Against `03_dashboard_reference_HQ_3x.png`: this was the single largest
confirmed gap on the site — a thin `h-16` horizon strip and an `h-40`
standing figure, versus the reference's dominant full-width planet + seated
figure + debris composition. Three new illustrations built
(`SeatedAstronaut`, `PlanetDisc`, `DebrisField` — see
`docs/UI_REDESIGN_SPEC.md`) and the scene rebuilt around them at up to
30rem/26rem scale. Also found and fixed a second, previously-uncovered
instance of the Phase-3-documented CSS Grid `min-width:auto` overflow trap:
the dashboard's three widget grids let their `Card` children force overflow
at 320px specifically (the Phase 3 audit's sweep checked 390px, which this
passed). 30px of real overflow before the fix, 0px after at 320/390/768px.

### 4. 404 scene (`0daebc4`)

Against `04_404_reference_HQ_3x.png`: the astronaut was upright, small, and
alone. Reused the existing `AstronautFigure` (coin-head variant) at much
larger scale with a genuine 28° tilt — verified via
`getBoundingClientRect()` AABB math, since a mostly-symmetric figure's
rotation is subtle to eyeball in a static screenshot — plus `PlanetDisc`
bleeding in from the corner and 5 animated `DebrisField` pieces.

### 5. Docs hero (`f35d4d3`)

Against `02_docs_reference_HQ_3x.png`: the book stack illustration was
already present and already large-ish, but read the *wrong labels* — AI
REASONING / GRAPH MODELS / FORMAL METHODS / SMART CONTRACTS, the home
page's research-pillar labels, applied here by a hardcoded default rather
than content specific to this page. The reference's stack reads RESEARCH /
TAXONOMY / CASE STUDIES / METHODOLOGY, matching what `/docs` contains.
Fixed by making `BookStack`'s labels a prop and giving the docs hero its own
correct set; also enlarged it further to match the reference's weight.

## Verification run on every commit above

- `pnpm --filter web typecheck` and `pnpm --filter web lint` — clean.
- Full offline Playwright suite (`critical-flow`, `accessibility`,
  `ssr-visibility`) on both the `chromium` and `mobile` projects — 26/26
  passing after every change.
- `document.documentElement.scrollWidth` vs. `clientWidth` at
  1440/1024/768/640/390/320px on every touched route — 0px overflow after
  every fix (with the two grid/flex bugs above caught precisely because
  this was run, not skipped).

## Screenshots

Current-state screenshots (post-fix, this pass) at desktop (1440px) and
mobile (390px) for all four reference pages are saved under
`docs/assets/ui-redesign/`: `home-desktop.png`, `home-mobile.png`,
`docs-desktop.png`, `docs-mobile.png`, `dashboard-desktop.png`,
`dashboard-mobile.png`, `not-found-desktop.png`, `not-found-mobile.png`.

## Honest status: what this pass covers and what it doesn't

**Covered, verified against the reference images directly:** the hero,
pipeline, and taxonomy sections of the home page; the docs page hero; the
dashboard's closing illustration scene and a real overflow bug in its widget
grid; the 404 page. Plus two real, previously-uncovered horizontal-overflow
bugs and one real SSR-visibility bug, each with a regression test or direct
before/after measurement.

**Not covered by this pass** — a further pass should treat these as the next
priorities, in roughly this order:

1. **Illustration density/weight pass across the remaining home sections**
   (Problem's hourglass, taxonomy card icons, case-studies row) — these are
   structurally correct and use real data, but weren't individually
   re-measured against the reference at the same rigor as the hero.
2. **New Analysis guided-workflow visual redesign** — the underlying
   submit/poll logic is real (wired in Round 2) and was not touched; only
   its visual presentation as a step-by-step guided flow (per the original
   brief) remains to be built.
3. **Analysis Results workspace** — per the original brief's correction to
   inspect the backend before adding tabs: `analysis.graph` (fund-flow),
   `finding.validated` (Foundry), and the RO3/holdout evaluation artifacts
   are real data that could back additional tabs beyond the current
   Overview/Findings/Asset Flow/Report set — this investigation and any
   resulting tab additions were not done this pass.
4. **Secondary app routes** (History, Projects, Reports, Taxonomy, Research,
   Settings) — not individually re-screenshotted against a reference (none
   of the four reference images covers them directly); still on the
   pre-existing visual treatment.
5. **Motion choreography catalogue and shadcn/ui evaluation** from the
   original brief — not started this pass; the motion fixes made here were
   bug fixes (SSR-opacity) and scene-specific animations (debris drift, 404
   tilt), not a systematic pass over every listed interaction.
6. **Full 18-illustration inventory** — three new illustrations were added,
   scoped to confirmed gaps; the remaining named illustrations from the
   original brief were not built (see `docs/UI_REDESIGN_SPEC.md`'s
   "Not built this pass" note).

None of the above was silently dropped — this list is that documentation,
per the same no-fabrication standard the rest of this project's docs hold
to (`docs/LIMITATIONS.md`, `docs/AUDIT_COMPLIANCE_MATRIX.md`).
