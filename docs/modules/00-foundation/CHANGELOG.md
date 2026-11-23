# V0 Foundation: Changelog

## [0.0.4] - 2026-11-23 (backup JSON binding fix, remote validation pending)
### Fixed
- Serialize MySQL JSON objects and arrays as scalar JSON text before constructing SQL dump `INSERT` statements.
- Added a unit test for JSON dump bindings. Local quality and 39/39 unit checks pass; MySQL restore rerun pending.

## [0.0.3] - 2026-11-23 (integration CI follow-up, remote validation pending)
### Fixed
- Student integration tests now sign in as the seeded linked student, verify their own record, and assert another student's record is hidden.
- Backup integration expectations now account for the seeded baseline backup.
- CI provisions the restore test's dedicated `sms_audit_*` schema and uses temporary storage isolated from repository artifacts.
- Remote quality/migration checks pass; the full suite reaches 114/115 with backup restore still failing (CC-F-601).

## [0.0.2] - 2026-11-23 (CI follow-up, remote validation pending)
### Fixed
- Root typecheck builds the shared package declarations before checking workspace imports, so clean checkouts do not depend on ignored build output.
- The first Gitleaks history scan passed; the first CI run identified this clean-checkout issue and the full rerun is pending.

## [0.0.1] - 2026-11-23 (audit patch, remote validation pending)
### Added
- Added a GitHub Actions quality gate for lint, typecheck, build, npm audit, MySQL 8.4 migration/rollback, and the full test suite.
- Added a full-history Gitleaks job with pinned action revisions and read-only repository permissions.
- Added a guarded audit-schema migration runner for CI; it refuses database names outside `sms_audit_*`.
- Remote workflow execution remains pending (CC-F-601).

## [0.0.0] - 2026-11-22
### Added
- Monorepo workspace configuration (`shared`, `backend`, `frontend`).
- Root configuration files: `package.json`, `tsconfig.base.json`, `.gitignore`, `.env.example`.
- Shared type definitions: `ApiResponse`, `ApiErrorResponse`, `HealthStatusData`, and `ModuleManifest`.
- Express backend application with Helmet, CORS, and centralized error handler.
- `/health` and `/api/v1/health` status endpoints.
- Knex configuration and initial migration script for MySQL 8.4 LTS.
- Responsive HTML/TS frontend shell displaying real-time system health.
- Vitest integration test suite for health API.
- All 8 standard module documentation files in `docs/modules/00-foundation/`.
