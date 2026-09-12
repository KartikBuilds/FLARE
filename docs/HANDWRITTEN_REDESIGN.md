# Handwritten Redesign

A full replacement of the FLARE front-end visual system, built on two brand
colors and a shared motion vocabulary.

- **Branch:** `feat/handwritten-redesign` (branched from `main`)
- **Screenshots:** [`docs/assets/handwritten-redesign/`](./assets/handwritten-redesign/)

The previous illustrated editorial design is untouched on `main`; a separate
ASCII-terminal exploration lives on `feat/ascii-redesign`.

---

## 1. The idea

A research notebook. Burgundy ink (`#7F011F`) written on warm cream paper
(`#F5EBD0`): boxes drawn by hand rather than snapped to a grid, numbers and
margin notes in a handwritten face, and long-form prose left in a typeface you
can actually read a thousand words of.

The two brand colors are not accents on top of a neutral system — they *are*
the system. Every other token is a tint, shade or neighbour of one of them,
which is what makes the marketing site, the docs and the analysis console read
as one object.

## 2. Color

All tokens live in `apps/web/app/globals.css` under `@theme`. Token *names*
were kept from the previous system (`paper`, `ink`, `line`, `muted`, …) and
only their values changed, so every component already written in those terms
adopted the new palette without edits.

| Token | Value | Role |
| --- | --- | --- |
| `paper` | `#f5ebd0` | the page |
| `paper-flat` | `#fbf6e7` | raised card |
| `paper-dim` / `paper-deep` | `#ebddbb` / `#e3d2ac` | fills, insets |
| `ink` | `#7f011f` | body text, brand, primary fill |
| `ink-soft` | `#9a2a3e` | secondary text |
| `ink-deep` | `#56010f` | headings |
| `charcoal` / `-soft` / `-line` | `#4a0113` / `#61061f` / `#7d2c3c` | the wine shell (app sidebar, footer, inverted sections) |
| `line` / `-soft` / `-strong` | `#d8c49b` / `#e6d8b8` / `#b99c63` | rules on paper |
| `muted` / `-soft` | `#8e4a55` / `#b38a90` | pencil / meta |
| `accent` / `accent-ink` | `#7f011f` / `#f5ebd0` | brand fill + its text |
| `highlight` | `#e8b44f` | the one non-burgundy note; accents on wine |

### Contrast

Measured against `--color-paper`:

| Pair | Ratio | |
| --- | --- | --- |
| `ink` on paper | 9.18:1 | AAA |
| `ink-soft` on paper | 6.37:1 | AA |
| `muted` on paper | 5.42:1 | AA |
| `danger` on paper | 6.53:1 | AA |
| `severity-high` on paper | 4.99:1 | AA |
| `warning` on paper | 4.98:1 | AA |
| `success` on paper | 5.34:1 | AA |
| `paper` on `charcoal` | 13.55:1 | AAA |
| `highlight` on `charcoal` | 8.49:1 | AAA |

`accent` previously resolved to a lime that only ever appeared on dark
surfaces. As burgundy it would have been invisible there, so every
dark-surface accent (pipeline tabs, sidebar active icon, footer hover) moved
to `highlight`.

The risk donut had been drawn in hard-coded ink greys. It now uses the
severity scale, which steps hue *and* lightness together so the ring survives
greyscale, next to a legend that names every slice — severity is never carried
by color alone.

## 3. Type

Four faces, all already vendored under `apps/web/app/fonts/` (SIL OFL,
self-hosted, no CDN).

| Face | Used for |
| --- | --- |
| Libre Baskerville (`font-display`) | headings |
| IBM Plex Sans (`font-sans`) | body and UI |
| IBM Plex Sans Condensed (`font-condensed`) | labels, buttons, eyebrows |
| **Caveat** (`font-handwritten`) | section numerals, margin notes, the sidebar sign-off |

The handwritten face is deliberately confined to marks a researcher would
actually have written by hand. Running prose in Caveat would look like the
theme and read like a hostage note.

## 4. Hand-drawn geometry

Boxes get asymmetric elliptical corner radii, which makes a plain border read
as a rectangle sketched freehand:

```css
.sketch-box   { border-radius: 14px 220px 12px 190px / 200px 12px 210px 14px; }
.sketch-box-2 { border-radius: 205px 12px 195px 14px / 12px 190px 14px 215px; }
.sketch-box-3 { border-radius: 12px 195px 16px 205px / 190px 16px 200px 12px; }
.sketch-control  /* tighter radii, for buttons and chips */
.sketch-circle   /* a circle that never quite closes */
```

Three box variants exist so a grid of cards never repeats the same wobble;
`Card` takes a `sketch` prop and callers cycle it. Diagram *frames* are
hand-drawn, but the nodes inside a React Flow graph stay on true rectangles —
wobbling every node fights legibility at the size they render.

Also in `globals.css`: `paper-ruled`, `paper-grid`, `paper-margin`,
`ink-highlight`, `ink-underline`, `tape`, `bg-grain`.

## 5. Motion

Shared curves, durations and springs live in `apps/web/lib/motion.ts`; the
components are in `apps/web/components/motion/`.

| Component | What it does |
| --- | --- |
| `Reveal` / `RevealGroup` / `RevealItem` | scroll reveals, with stagger |
| `TextReveal` | headings that write themselves on, by line or by word |
| `HandNote` | margin notes that scratch in at an angle |
| `Parallax` / `ScrollSettle` | depth and settle on scroll |
| `ScrollProgress` | ink drawn across the top as the page is read |
| `InkUnderline` / `InkCircle` / `InkArrow` | SVG pen strokes that draw themselves |
| `InkBlots` | ambient ink bleeding through section backgrounds |
| `Magnetic` | controls that lean toward the pointer |
| `TiltCard` | shallow pointer tilt plus an ink bloom |
| `InkCursor` | a nib and its sprung halo |
| `PageTransition` | route change: ink wipe + the page lifting into place |

Where each is used:

- **Hero** — masked headline reveal, an underline drawn under "back out?",
  parallax on the corner machinery, staggered assembly of the fund-flow
  diagram, magnetic CTAs.
- **Sections** — masked headings, staggered card and row reveals, parallax on
  section glyphs, handwritten notes arriving after the copy.
- **Navigation** — the site header retracts on the way down and returns on the
  way up; the desktop underline glides between links on a shared `layoutId`;
  the mobile overlay drops in with staggered links; the app sidebar's active
  pill and the analysis tab underline both animate between positions.
- **Route changes** — `app/template.tsx` remounts per navigation, which drives
  an ink panel sweeping across and the incoming page lifting into place.
- **Pointer** — ink cursor, magnetic controls, card tilt with an ink bloom.

### Three rules the motion layer follows

**1. Nothing above the fold starts at opacity 0.** Motion serialises `initial`
into the server-rendered HTML. An opacity-0 start therefore ships a blank hero
to anything that has not run the reveal JS yet — crawlers, no-JS clients, slow
hydration. Above-the-fold surfaces animate transform only. (The repo had
already found this the hard way; the existing comments in `Hero` and
`TaxonomySection` record it.)

**2. Below-the-fold reveals have a no-script floor.** They *do* fade, so every
one is tagged `data-reveal` and the root layout carries:

```html
<noscript><style>[data-reveal]{opacity:1!important;transform:none!important}</style></noscript>
```

**3. Reduced motion means instant, never absent.** Each variant factory takes
`reduced` and collapses to a visible end state. That alone was not enough:
`usePrefersReducedMotion` resolves in an effect, so it reads `false` for the
first render, by which point Motion has already committed opacity-0 to every
off-screen reveal — leaving them stranded until scrolled to. A stylesheet
`!important` outranks Motion's inline style, so the guarantee is now
unconditional:

```css
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { opacity: 1 !important; transform: none !important; }
}
```

Verified: with `prefers-reduced-motion: reduce`, 0 of 44 below-fold reveals on
the home page are hidden before any scroll; without it, 34 are correctly
waiting to animate.

## 6. Accessibility

- Pointer-only effects (ink cursor, magnetic, tilt) are gated on
  `(pointer: fine)` **and** reduced motion being off. Touch and keyboard users
  get ordinary, stationary controls.
- The native cursor is only suppressed once the ink cursor has actually
  mounted (`body.has-ink-cursor`), so no-JS, touch and reduced-motion visitors
  keep their pointer. Text inputs keep a real caret cursor regardless.
- `TextReveal` splits glyphs into spans, hides them with `aria-hidden`, and
  puts the full string on the host element — a screen reader hears one clean
  sentence, not fragments. Covered by test.
- The mobile menu is a labelled `dialog`, closes on Escape, locks body scroll,
  and returns focus to its trigger.
- Decorative marks (`InkBlots`, ink strokes, paper textures) are `aria-hidden`
  and `pointer-events-none`.
- Severity is always paired with a text label.

## 7. Verification

| Check | Result |
| --- | --- |
| `pnpm typecheck` | pass |
| `pnpm lint` | pass, 0 problems |
| `pnpm test` | 38 passed (25 pre-existing + 13 new) |
| `pnpm build` | compiled, 24 static pages |
| Horizontal overflow @ 1440 / 390 / 320 | none on any route |
| Console errors | none (bar the expected 404 status on `/404`) |
| Reduced-motion content visibility | verified programmatically |

New tests in `apps/web/__tests__/motion-primitives.test.tsx` cover the
guarantees most likely to regress silently: reveals render their children,
`TextReveal` exposes one accessible name, reduced motion still renders
everything, and pointer-only effects stay off a coarse pointer.

`vitest.setup.ts` gained stubs for `matchMedia`, `IntersectionObserver` and
`ResizeObserver` — jsdom implements none of them, and the inert observers mean
tests assert the pre-animation state, which is exactly what a crawler sees.

### Bugs found and fixed along the way

- **Reveals stranded in the top 12% of a page.** The shared viewport margin
  was `-12% 0px -8% 0px`. A negative *top* inset shrinks the observer root
  downward, so an element sitting entirely inside that strip on load never
  intersects and never reveals — every app page header's margin note was
  invisible. The top inset is now `0`; the bottom inset, which is what
  actually gives reveals their timing, is unchanged.
- **Dashboard overflowed at 320px.** The page header's action column was
  `shrink-0` around a long status badge. Now `min-w-0`, dropping below the
  title on narrow screens.
- **Analysis tabs overflowed at 320px** (pre-existing). The strip now scrolls,
  matching the pipeline tablist.
- **Two stacked reading-progress bars on docs pages.** `ScrollProgress` in the
  root layout draws the identical bar site-wide, so `components/docs/
  ReadingProgress` was removed.
- **Smooth scrolling fought route restoration.** `<html>` now carries
  `data-scroll-behavior="smooth"` so Next suppresses it during navigation.

## 8. What is unchanged

No backend, analyzer, detector, scoring, graph, benchmark or research code was
touched. `getIncidents()` still reads `research/incidents/*.json`, the FLARE
score, fund-flow graph, Slither integration and Foundry validation are
untouched, and every figure on screen still comes from the same source with
its verification status intact. TanStack Query behaviour, upload validation and
demo/live labelling are unchanged.

## 9. Known limitations

- **Below-the-fold reveals rely on JS for their fade.** The `<noscript>` rule
  covers scripting being off entirely, but a client that runs JS and then
  fails mid-hydration could leave a section faded out. Above-the-fold content
  is immune by construction.
- **No automated axe pass in this branch.** Contrast was computed by hand and
  the patterns above were checked manually; wiring `@axe-core/playwright`
  (already a dependency) into CI is the obvious next step.
- **`TextReveal` line breaks are authored, not computed.** Lines are passed in
  explicitly, so a heading whose break looks wrong at some width needs its
  `lines` array adjusted rather than reflowing on its own.
- **The ink cursor hides the native pointer on fine-pointer devices.** Gated
  on reduced motion and pointer type, and text fields keep their caret, but it
  remains a deliberate trade.
- **Screenshots are dev-server captures**, not production builds. The build is
  verified separately.
