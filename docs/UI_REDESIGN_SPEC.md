# FLARE UI Redesign — Design System Reference

Reference baseline: `design/references/01_home_reference_HQ_3x.png`,
`02_docs_reference_HQ_3x.png`, `03_dashboard_reference_HQ_3x.png`,
`04_404_reference_HQ_3x.png`. This document is the token/illustration/motion
reference for that redesign; `docs/UI_REDESIGN_REPORT.md` is the before/after
narrative and honest status of what's covered.

## Design tokens

Tokens live in `apps/web/app/globals.css` under `@theme`/`@theme inline`
(Tailwind CSS v4). This pass did not widen the palette or type scale beyond
what already existed there — the confirmed gap against the references was
**composition density and illustration scale**, not the token values
themselves (verified by screenshotting the live site next to each reference
before making any change; see the report for what was actually measured).
Existing tokens in use:

- `paper` / `paper-flat` — the warm off-white ground.
- `ink` / `ink-soft` / `muted` — text hierarchy.
- `charcoal` / `charcoal-soft` / `charcoal-line` — the dark shell (pipeline
  section, app sidebar, footer, dashboard scene card).
- `accent` (lime) — reserved for "live/verified" state only (e.g. the "Live
  Engine" badge, "Live Engine" tab badges on the dashboard).
- `danger` — reserved for blocked/failed paths (the hero's broken withdrawal
  pipe, the taxonomy "withdrawal failures" icon).
- `line` / `charcoal-line` — hairline borders.

Display type uses `font-display` (a bold serif) for headlines, `font-sans`
for body copy, `font-condensed` for labels/eyebrows/uppercase micro-copy, and
`font-handwritten` for `Annotation` marginal notes — all four already
present and used consistently across routes.

## Illustration system

All illustrations live in `packages/ui/src/illustrations/` and share three
primitives from `shared.tsx`:

- `HatchDef` — the diagonal cross-hatch fill pattern every machine/figure
  uses for its filled surfaces.
- `Bolt` / `BoltRow` — rivet/bolt details on housings.
- `IllustrationFrame` — the accessible SVG wrapper (title + role handling
  for meaningful vs. decorative use).

Existing illustrations (pre-dating this pass): `FlareMark`, `CoinAsset`,
`VaultModule`, `ProtocolCore`, `PipeSegment` (with a `broken` variant),
`JunctionBox`, `HourglassGlyph`, `PipelineModule`, `TaxonomyIcon` (5
category glyphs), `BookStack`, `AstronautFigure` (standing, with `visor`/
`coin` head variants), `OrbitDiagram`, `MoonSurface`.

New illustrations added this pass, because the reference compositions they
appear in (dashboard closing scene, 404 scene) needed a distinct pose/asset
that reuse couldn't provide — not a substitute for reuse elsewhere:

- **`SeatedAstronaut`** — a seated-on-a-ledge pose (knees drawn up, looking
  out), used on the dashboard. Distinct silhouette from `AstronautFigure`'s
  standing pose; same stroke/hatch/bolt language.
- **`PlanetDisc`** — a large circular cratered planet for corner placement
  at real scale, replacing the old `MoonSurface` horizon-strip treatment
  where the reference calls for a dominant circular body (dashboard, 404).
  `MoonSurface` is unchanged and still used where a horizon strip is
  actually correct.
- **`DebrisField`** — small floating rock fragments (3 shape variants),
  scattered and gently animated around the dashboard/404 scenes.

`BookStack` was changed from hardcoded spine labels to an optional `books`
prop (default unchanged, so `ResearchSection`'s existing usage is
unaffected) — the docs hero needed different labels (RESEARCH / TAXONOMY /
CASE STUDIES / METHODOLOGY, matching what `/docs` contains) than the
research pillars it was defaulting to.

**Not built this pass**: the full 18-illustration inventory implied by the
original redesign brief (dedicated intake-machine and scanner/terminal
assets, per-route bespoke glyphs beyond the taxonomy set, etc.). The three
new illustrations above were scoped to the specific, confirmed reference
gaps found by direct screenshot comparison, not built speculatively ahead of
a measured gap. See the report for the explicit list of what a further pass
should cover.

## Motion

Existing pattern, reused and fixed rather than replaced: Motion (`motion/
react`) `whileInView`/`initial`/`animate` variants, gated by the existing
`usePrefersReducedMotion()` hook from `@flare/ui`.

**Binding rule established this pass**: never animate `opacity` on
above-the-fold or otherwise-essential content. Motion applies a component's
`initial` prop as a *synchronous inline style during Next.js SSR* — an
`initial={{ opacity: 0 }}` therefore ships `style="opacity:0"` in the raw
server-rendered HTML, genuinely invisible to any client that doesn't run (or
hasn't yet run) the reveal JS: no-JS clients, crawlers, slow hydration. This
was a real, confirmed bug (see the report), not a stylistic preference.
Translate-only reveals (`y`/`x` offsets) are used instead everywhere content
must be visible without JS. The only remaining `opacity` animations in the
codebase are on elements that are legitimately absent from initial render
(conditionally-mounted mobile drawers) or purely decorative and
`aria-hidden` (the docs reading-progress bar) — both audited and confirmed
safe, not oversights.

Rotation/position animations (dashboard debris drift, 404 tumble) use plain
`animate`/`transition` with no `initial`, so there's no equivalent risk —
`rotate`/`y` don't hide content the way `opacity: 0` does.

## Overflow discipline

Two real, previously-uncovered instances of the CSS Grid/flex
`min-width: auto` overflow trap (the same bug class documented and fixed in
the Phase 3 audit, `docs/AUDIT_COMPLIANCE_MATRIX.md` B1/B16) were found and
fixed this pass — one in `PipelineSection`'s stage tablist (real overflow at
640/768px), one in the dashboard's widget grids (real overflow at 320px
only, below what Phase 3's 390px sweep covered). Every layout change in this
pass was verified with a `document.documentElement.scrollWidth` check at
1440/1024/768/640/390/320px, not just visual screenshot comparison.
