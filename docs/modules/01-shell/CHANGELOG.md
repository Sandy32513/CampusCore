# V1 Application Shell: Changelog

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
