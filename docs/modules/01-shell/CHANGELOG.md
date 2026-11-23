# V1 Application Shell: Changelog

## [1.0.4] - 2026-11-23
### Fixed
- Reconciled the dashboard unresolved Critical/High count after CC-F-201, CC-F-204, and CC-F-205 passed the MySQL outage/recovery validation (8 total: 0 Critical, 8 High).
- Advanced the shell patch footer to v1.0.4.

### Verified
- The Playwright dashboard regression assertion checks the current 8-finding count and severity breakdown.

## [1.0.3] - 2026-11-23
### Fixed
- Reconciled the dashboard unresolved Critical/High count after CC-F-302 passed live browser/API/MySQL validation (11 total: 1 Critical, 10 High).

### Verified
- Playwright dashboard regression assertion passes on the current audit status; CI also runs the real authentication flow against the isolated MySQL schema.

## [1.0.2] - 2026-11-23
### Fixed
- Added visible keyboard focus indicators and improved text, link, button, and status contrast.
- Made dialogs hidden when closed, labeled them and their form controls, trapped keyboard focus while open, and restored focus after closing.
- Added Escape dismissal, mobile navigation state announcements, and responsive header/footer behavior through 375px, 768px, 1024px, and 1440px widths.
- Respected the reduced-motion preference.
- Reconciled the dashboard's unresolved Critical/High finding count after the validated fixes (12 total: 1 Critical, 11 High).

### Verified
- Playwright and axe: 6 browser tests passed; zero serious or critical axe findings across 11 primary UI states and the student admission dialog.
- Responsive layout checks passed at 375px, 640px (the 200%-reflow equivalent of 1280 CSS px), 768px, 1024px, and 1440px; the durable screenshot set covers the four required widths. API calls were stubbed as unauthorized and no database was used.

## [1.0.1] - 2026-11-23
### Fixed
- Reconciled dashboard module counts, Wave 7 phase, and Gate A8 readiness with the orchestration status board.
- Removed the unverified `41 / 41` test-pass claim.
- Marked the full set of 12 frozen modules in the shared catalog and shell cards.
- Reported API/database health and signed-in role only after the corresponding checks succeed.
- Showed frozen status and the shell-view limitation for frozen modules without an interactive shell screen.

### Verified
- Playwright dashboard/catalog checks: 2 passed with API requests stubbed as unauthorized; no database was used.

## [1.0.0] - 2026-11-22
### Added
- Complete UI layout shell: Header, responsive Sidebar, Breadcrumbs, Footer, and Dashboard container.
- Mobile drawer navigation with responsive toggle (< 1024px).
- Design system components showcase: Button variants, Form controls, Data table, Modal dialog with focus trap and ESC dismiss, and Toast notification system.
- Compile-time module registry (`MODULE_CATALOG`) in `@campuscore/shared`.
- API endpoints `GET /api/v1/modules` and `GET /api/v1/modules/:slug`.
- Honest "Coming Soon" page template for all unbuilt modules, preventing dead links.
- Integration tests in `backend/tests/modules.test.ts`.
- All 8 standard documentation files in `docs/modules/01-shell/`.
