# V0 Foundation: Changelog

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
