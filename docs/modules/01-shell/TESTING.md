# V1 Application Shell: Testing Documentation

## 1. Test Strategy
- **API Tests (Vitest & Supertest):**
  - Verify `/api/v1/modules` returns the complete catalog of modules.
  - Verify individual module lookup `/api/v1/modules/:slug`.
  - Verify error handling on unknown slug (`404 MODULE_NOT_FOUND`).
- **UI & Viewport Testing:**
  - Mobile viewport (375px): Hamburger drawer toggle operational.
  - Tablet viewport (768px): Drawer operational.
  - Desktop viewport (1024px+): Sidebar pinned.
  - Accessibility: Modal focus trap and ESC dismissal.

## 2. Test Execution
```bash
npm test --workspace=@campuscore/backend
```
Expected output:
- `modules.test.ts` (3 tests passed)
- `health.test.ts` (2 tests passed)
- Total 5 tests passed with 0 failures.
