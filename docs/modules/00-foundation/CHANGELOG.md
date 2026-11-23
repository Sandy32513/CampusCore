# V0 Foundation: Changelog

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
