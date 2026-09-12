# FLARE ASCII Terminal Redesign Specification

## Overview

Complete redesign of the FLARE frontend into an ASCII terminal-themed research platform, preserving all backend functionality while transforming the visual system.

**Baseline Tests (Passing):**
- Typecheck: ✓
- Unit Tests: 25/25 passing
- Build: Ready
- E2E: Ready for testing after implementation

## Design System

### Color Tokens

```css
--terminal-bg: #080B09;           /* Main background */
--terminal-panel: #0D120F;        /* Panel backgrounds */
--terminal-elevated: #121914;     /* Elevated surfaces */
--terminal-line: #263229;         /* Dividers and borders */
--terminal-text: #D8E2D9;         /* Primary text */
--terminal-muted: #778279;        /* Muted/secondary text */
--terminal-green: #9EF01A;        /* Success, live, verified */
--terminal-green-soft: #5F8F17;   /* Soft accent green */
--terminal-amber: #E8B44F;        /* Warning, partial, medium risk */
--terminal-red: #E65F5C;          /* Critical, blocked, error */
--terminal-cyan: #65C7D0;         /* Info, secondary accent */
--terminal-white: #F0F4EF;        /* Light highlights */
```

### Typography

**Primary Font:** IBM Plex Mono (self-hosted)
**Fallback:** Geist Mono, JetBrains Mono, Space Mono, monospace

**Heading Styles:**
- Use terminal command formatting: `$ COMMAND_STYLE`
- Display monospace for all headings
- Maintain readable line length

## Component Library

### Core ASCII Components

1. **TerminalWindow** - Bordered container with header
2. **TerminalHeader** - Title + status bar
3. **CommandPrompt** - CLI-style input
4. **ASCIIFrame** - Responsive box-drawing borders
5. **ASCIISection** - Grouped content area
6. **ASCIIButton** - Terminal-styled button
7. **ASCIIBadge** - Status indicators
8. **ASCIIProgress** - Progress indicators
9. **ASCIISeparator** - Dividing lines
10. **ASCIIStat** - Key value display
11. **ASCIIAlert** - Status messages
12. **ASCIIStatusLine** - Header status bar
13. **ASCIIDataTable** - Structured data display
14. **ASCIIAccordion** - Expandable sections
15. **ASCIIFileTree** - Hierarchical navigation
16. **ASCIITimeline** - Process steps
17. **ASCIIGraphLegend** - Graph annotations
18. **BlinkingCursor** - Terminal animation
19. **ScanLineOverlay** - CRT effect
20. **TerminalToast** - Notifications
21. **TerminalDialog** - Modal windows
22. **TerminalDrawer** - Slide-out panels
23. **TerminalTabs** - Tab navigation
24. **TerminalSkeleton** - Loading placeholder

## Route Redesigns

### Public Routes

#### 1. Home Page (/)
- **Hero Section**: ASCII fund-flow diagram with animation
- **Problem Section**: Terminal ledger of fund-lock incidents
- **Pipeline Section**: 9-stage interactive process
- **Taxonomy Section**: 5 distinctive terminal modules
- **Research Section**: Formal methods and analysis status
- **Case Studies**: Terminal incident ledger
- **Footer**: System status display

#### 2. Documentation (/docs)
- **Layout**: Two-column file-tree + document viewer
- **Sidebar**: ASCII file-tree navigation
- **Content**: Comfortable reading typography
- **Search**: Command-line search interface
- **Mobile**: Drawer-based navigation

#### 3. Case Studies (/docs/case-studies)
- Terminal incident ledger
- Verification status indicators
- Taxonomy categorization
- Open-details actions

#### 4. Taxonomy Guide (/docs/taxonomy)
- 5 distinctive terminal modules
- ASCII illustrations for each category
- Detector counts
- Example signals

#### 5. Detectors (/docs/detectors)
- Terminal detector manual
- Implementation status
- Signal examples

### Application Routes

#### 6. Dashboard (/app)
- **Header**: Control terminal status line
- **Modules**: Real-time statistics
- **Central Diagnostic**: Latest fund-flow state
- **Analysis History**: Terminal log format
- **Risk Distribution**: Terminal chart
- **Benchmark Status**: Real metrics

#### 7. New Analysis (/app/analysis/new)
- **Guided Terminal Session**: Interactive workflow
- **Input Selection**: Menu-driven options
- **Progress Display**: Real validation and status
- **Meaningful Errors**: No internal info leakage

#### 8. Analysis Results (/app/analysis/[id])
- **Summary**: FLARE score, risk, confidence
- **Findings**: Structured diagnostic records
- **Asset Flow**: React Flow styled as circuit schematic
- **Dependencies**: Terminal format
- **Validation**: Coverage and status
- **Report**: Export options

#### 9. History (/app/history)
- Terminal analysis log
- Real-time status polling
- Filtering and sorting

#### 10. Projects (/app/projects)
- Terminal workspace/file registry
- Project listing in terminal format

#### 11. Reports (/app/reports)
- Export archive interface
- Terminal-styled listings

#### 12. Research (/app/research)
- Research corpus display
- Formal methods status
- Static/graph analysis coverage

#### 13. Taxonomy (/app/taxonomy)
- Detector manual reference
- Real detection stats

#### 14. Settings (/app/settings)
- Terminal configuration panel
- Theme toggles (CRT effects, reduced motion)
- Preferences

#### 15. 404 Page
- Terminal failure screen
- ASCII astronaut or probe illustration
- Navigation actions

## ASCII Diagrams

### Required Diagrams

1. FLARE logo mark (ASCII)
2. Ethereum asset
3. Asset intake
4. Contract vault
5. Protocol core
6. Entry path
7. Valid withdrawal path
8. Broken exit path
9. Contract dependency graph
10. State machine
11. Recovery mechanism
12. Transfer pipeline
13. Analysis scanner
14. Research database
15. Incident timeline
16. Terminal astronaut/probe (404)

### Diagram Requirements

- Scalable and responsive
- No page-level overflow
- Preserved alignment
- Accessible text descriptions
- Screen-reader summaries
- Mobile alternatives

## Animation & Motion

### Motion for React

Used for:
- Character-by-character headings (short commands only)
- Command execution effects
- Cursor movement
- Status-line updates
- Progressive diagram assembly
- Path tracing through fund flows
- Finding-line expansion

### Reduced Motion

- Render all content immediately
- Remove cursor blinking
- Remove CRT flicker
- Preserve complete readability

### CRT Effects (Optional, Toggleable)

- Very subtle scanlines
- Minimal phosphor glow
- Rare screen refresh transition
- Slight terminal noise
- Vignette only on hero areas

## Responsive Breakpoints

| Viewport | Requirements |
|----------|--------------|
| 1440px   | Full desktop layout |
| 1024px   | Tablet landscape |
| 768px    | Tablet portrait |
| 390px    | Mobile landscape |
| 320px    | Mobile portrait |

**Requirements:**
- No page-level horizontal overflow
- Responsive ASCII diagrams
- Compact mobile alternatives
- Scrollable code inside containers
- Mobile drawers for navigation
- Touch-friendly controls (48px minimum)

## Accessibility

### Standards Compliance

- WCAG 2.1 AA minimum
- Semantic HTML
- Real buttons and links (no ASCII substitutes)
- Logical focus order
- Visible focus indicators
- Screen-reader summaries
- Status announcements
- Reduced motion support
- 4.5:1 contrast ratio minimum
- No meaning conveyed by color alone
- Text zoom to 200%
- Keyboard navigation throughout

### ASCII-Specific

- Diagrams use `aria-hidden` when decorative
- Informational diagrams have text alternatives
- Table structure preserved for data
- Form validation accessible
- No constant terminal sound

## Testing Strategy

### Test Categories

1. **Typecheck**: Full TypeScript validation
2. **Unit Tests**: Component logic (25+ tests)
3. **Integration**: Route functionality
4. **Accessibility**: axe-core scanning
5. **Responsive**: Desktop, tablet, mobile
6. **Performance**: Load time, animation smoothness
7. **E2E**: Playwright workflow tests
8. **Reduced Motion**: CSS media query verification

### Required Passing Tests

```bash
pnpm typecheck      # TypeScript
pnpm lint           # ESLint
pnpm test           # Vitest
pnpm build          # Next.js
pnpm e2e            # Playwright
```

## Performance Targets

- Lazy-load large diagrams
- Pause offscreen animations
- Memoize graph-to-ASCII conversion
- CSS-only scanlines
- No expensive continuous canvas effects
- Lighthouse score: >90

## Visual QA Checklist

After each major phase, verify:

- [ ] No broken box alignment
- [ ] ASCII readable and readable
- [ ] No excessive glow/effects
- [ ] Proper visual hierarchy
- [ ] No generic card grids
- [ ] Visual consistency across routes
- [ ] No empty/stub routes
- [ ] No fake terminal output
- [ ] No page overflow
- [ ] UI properly sized
- [ ] Mobile composition intentional

## Implementation Phases

1. **Setup** (Phase 0): Design tokens, typography, global shell
2. **Components** (Phase 1): ASCII component library
3. **Diagrams** (Phase 2): ASCII diagram primitives
4. **Public Site** (Phase 3-5): Home, Docs, Case Studies
5. **Dashboard App** (Phase 6-10): Dashboard, Analysis, History, etc.
6. **Polish** (Phase 11-14): Errors, loading, empty states, 404
7. **Animation** (Phase 15): Motion and transitions
8. **Refinement** (Phase 16-17): Responsive, accessibility, performance
9. **QA** (Phase 18-20): Testing, screenshots, final report

## Deliverables

- ✓ docs/ASCII_REDESIGN_SPEC.md (this file)
- docs/ASCII_REDESIGN_REPORT.md (final report)
- docs/assets/ascii-redesign/ (screenshots)
- ASCII component library
- ASCII diagram renderer
- Complete redesigned frontend

## Non-Negotiable Rules

- ✗ Do not stop after design plan
- ✗ Do not retain old illustrated design
- ✗ Do not combine old and new UI
- ✗ Do not use screenshots as backgrounds
- ✗ Do not fake commands or findings
- ✗ Do not change research results
- ✗ Do not break live analyzer
- ✗ Do not expose secrets
- ✗ Do not sacrifice accessibility
- ✗ Do not commit before verification

## Success Criteria

✓ Every frontend route belongs to unified ASCII terminal system
✓ Site no longer resembles old paper-and-ink interface
✓ Real analysis remains operational
✓ Terminal theme improves information density
✓ ASCII diagrams explain actual FLARE behavior
✓ Mobile layouts intentionally designed
✓ Reduced-motion mode complete
✓ All tests passing
✓ Screenshots prove transformation
✓ Report documents limitations

---

**Status:** Implementation Starting
**Branch:** feat/ascii-redesign
**Last Updated:** 2026-09-12
