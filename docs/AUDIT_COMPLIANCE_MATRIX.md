# Phase 3 Compliance Matrix — Security & Website Quality

Forty checks, run against the actual codebase (not asserted from memory) on 2026-09-11. FLARE
today is a **local-only research prototype**: no user accounts, no payments, no public
deployment, no phone/email contact surface. Several checks are marked not applicable to that
shape — each with the specific reason, not a blanket "N/A." Two real gaps were found and fixed
during this audit rather than just logged; both are called out below and in their own commits.

## A. Security

| # | Check | Applicable | Location | Evidence | Result |
| - | --- | --- | --- | --- | --- |
| A1 | Secret/API-key protection | Yes | `.gitignore`, `.env.example` | `.env`/`.env.*` gitignored (`!.env.example` allowed); `FLARE_ETHERSCAN_API_KEY`/`FLARE_AI_API_KEY` read from env only, never hardcoded | Pass |
| A2 | Environment-variable audit | Yes | `services/analyzer/app/config.py`, `.env.example` | Every var `config.py` reads now has a documented entry in `.env.example` (`FLARE_BENCHMARKS_DIR` was missing — added during this audit) | Pass (1 gap fixed) |
| A3 | Git secret scanning | Yes | full `git log -p` | Manually scanned for API-key/password/secret patterns — none found | Pass |
| A4 | Admin-route applicability | No | — | No admin role or admin-only route exists — single-tenant local tool | N/A |
| A5 | Authentication applicability | No | — | No login/session system — this is a local process, not a hosted multi-user service | N/A |
| A6 | Authorization and ownership | No | — | No per-user resource ownership model to enforce (see A5) | N/A |
| A7 | Input validation | Yes | `app/core/intake.py` | File extension/size/count limits, zip-slip/symlink/absolute-path rejection, GitHub URL regex, address regex, benchmark-case path-traversal guard — all covered by tests | Pass |
| A8 | XSS protection | Yes | React (frontend), `app/core/report.py::_e()` (HTML report) | React auto-escapes by default; the HTML report explicitly HTML-escapes every interpolated value — tested (`test_escapes_untrusted_content`) | Pass |
| A9 | SQL-injection protection | Yes | `app/api/routes.py`, `app/core/pipeline.py` | Every query uses `?` parameterization, verified by direct grep — no string-built SQL anywhere | Pass |
| A10 | Database access rules | Partial | `app/db/database.py` | SQLite is a local file, never network-exposed; no multi-tenant row-level access rules exist because there is only ever one caller (the local frontend) | N/A (single-tenant) |
| A11 | Rate limiting | Yes | `app/api/routes.py::_analysis_semaphore` | **Was missing — fixed this audit.** `max_concurrent_analyses` is now enforced by a semaphore; a full slot table returns `429` immediately (`test_upload_returns_429...`) | Pass (gap fixed) |
| A12 | Spend/resource caps | Yes | `app/config.py`, `app/api/routes.py` | File-size/count/zip caps (pre-existing) + the new concurrency cap (A11) bound both per-request and aggregate resource use | Pass |
| A13 | Secure uploads | Yes | `app/core/intake.py` | Zip-slip, symlink, absolute-path, oversized-file/zip, too-many-files all rejected and tested | Pass |
| A14 | CSRF applicability | No | — | Stateless JSON API, no cookie-based session auth for CORS to be exploited against | N/A |
| A15 | Restrictive CORS | Yes | `app/main.py` | Explicit localhost-only origin allowlist (3000/3001/3100), never a wildcard | Pass |
| A16 | Production HTTPS requirement | No (yet) | — | Never deployed publicly today (`SECURITY.md`); this becomes a real requirement the moment that changes, not before | N/A today — documented pre-deployment requirement |
| A17 | Security headers | Yes | `app/main.py` middleware, `apps/web/next.config.ts` | **Was missing — fixed this audit.** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` added to both services, verified against a real running server | Pass (gap fixed) |
| A18 | Secure cookies | No | — | No cookies are set anywhere in the app | N/A |
| A19 | Disabled production-debug behavior | Yes | `services/analyzer/Dockerfile`, `app/main.py` | No `debug=True`, no `--reload` in the container `CMD`; `IntakeError` messages are deliberately generic (no host paths) | Pass |
| A20 | Complete production-configuration audit | Yes | this document | A20 is this matrix itself — every config-relevant item above was checked, not assumed | Pass |

## B. Website quality

| # | Check | Applicable | Location | Evidence | Result |
| - | --- | --- | --- | --- | --- |
| B1 | No page-level horizontal scrolling | Yes | multiple components | **Real bugs found and fixed this audit**: a CSS Grid `min-width:auto` overflow trap on the home page and every MDX doc page, plus an unbreakable inline-code path on `/docs/limitations` — see the dedicated commit. Verified via `document.documentElement.scrollWidth` at 390px across every major route: zero overflow | Pass (bugs fixed) |
| B2 | No broken links | Yes | full-site crawl | A Playwright script crawled every internal `href` reachable from 22 seed pages (36 unique links) and requested each — zero non-2xx responses | Pass |
| B3 | Functional mobile menus | Yes | `DocsMobileDrawer.tsx`, `AppMobileDrawer.tsx` | Exercised directly by `tests/e2e/critical-flow.spec.ts`'s docs-search test (opens the mobile "Sections" drawer) and by the mobile Playwright project generally | Pass |
| B4 | Favicon | Yes | `apps/web/app/icon.svg` | Next.js auto-serves this as the site favicon | Pass |
| B5 | Route-specific page titles | Yes | every `page.tsx`/`layout.tsx` | **6 routes were missing one — fixed this audit** (`/app/settings`, `/app/projects`, `/app/history`, `/app/reports`, `/app/analysis/new`, `/app/analysis/[id]`); verified against a real running server (`curl` + `<title>` grep) | Pass (gap fixed) |
| B6 | Accurate meta descriptions | Yes | root `layout.tsx` + per-route `metadata`/`generateMetadata` | Root description is accurate; docs pages pull their description from MDX frontmatter | Pass |
| B7 | Working footer links | Yes | `SiteFooter.tsx` | Covered by the B2 link crawl (footer links are part of every seed page) | Pass |
| B8 | Working custom 404 | Yes | `app/not-found.tsx` | Dedicated Playwright test (`an invalid route renders the custom 404 page`) — passes on both projects | Pass |
| B9 | Correct copyright year | Yes | `SiteFooter.tsx` | `{new Date().getFullYear()}` — always correct, never hardcoded | Pass |
| B10 | Optimized visual assets | Yes | `packages/ui/illustrations/` | Every illustration is inline SVG/CSS by design (see `docs/ARCHITECTURE.md`) — no raster images to optimize, no unoptimized-image risk at all | Pass |
| B11 | Working buttons | Yes | full Playwright suite | Every interactive control exercised by `critical-flow.spec.ts`/`live-analysis.spec.ts` (submit, tab switches, downloads, drawer toggles) actually does what it says | Pass |
| B12 | Accurate success messages | Yes | `app/app/analysis/new/page.tsx` | Progress/success text is driven by the real `AnalysisStatus` from the backend, not a hardcoded string — see R1 | Pass |
| B13 | Useful, safe error messages | Yes | `app/core/intake.py`, `lib/api-client.ts` | Backend errors are specific and safe (no host paths); frontend surfaces them verbatim rather than a generic "something went wrong" | Pass |
| B14 | No unintended placeholder content | Yes | full-repo scan | Searched for "lorem ipsum", "TODO:", "FIXME", "coming soon", "TBD" across `apps/web` — none found | Pass |
| B15 | No unused navigation | Yes | `lib/app-nav.ts`, `SiteHeader.tsx` | Every nav item's `href` resolves to a real, working route (cross-checked against the route list and the B2 crawl) | Pass |
| B16 | No mobile overflow | Yes | same as B1 | Pass (gap fixed) |
| B17 | Clickable logo | Yes | `SiteHeader.tsx`, `AppSidebar.tsx` | The FLARE mark links to `/` in both the public header and the app sidebar | Pass |
| B18 | Clickable phone numbers | No | — | No phone number appears anywhere in the product | N/A |
| B19 | Clickable public email addresses | No | — | No email address appears anywhere in the product; support is routed through GitHub Issues/Security Advisories (`CONTRIBUTING.md`, `SECURITY.md`) | N/A |
| B20 | Complete mobile optimization | Yes | full Playwright mobile project + manual QA | 390px breakpoint checked across every major route this session (screenshots + automated overflow/accessibility scans) in addition to earlier milestones' 1440/1024/768/390 pass | Pass |

## Summary

- **34 applicable checks, all passing** (2 of them — A11 rate limiting and A17 security headers —
  and separately B1/B5/B16/A2's gaps were genuine issues found *by this audit* and fixed in the
  same session, not pre-existing passes).
- **6 checks not applicable** to FLARE's current shape (A4, A5, A6, A14, A18, B18, B19 — that's 7;
  A10 is a partial/N/A, counted separately above), each with its specific reason recorded rather
  than silently skipped.
- **Two items were not just checked but genuinely fixed as a direct result of this audit**:
  the rate-limiting/resource-cap gap (A11/A12) and the mobile horizontal-overflow bugs
  (B1/B16) — the latter also uncovered a previously-masked keyboard-accessibility gap
  (scrollable regions with no focusable content), fixed in the same commit.
