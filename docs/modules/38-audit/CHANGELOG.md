# V38 Audit Logs: Changelog

## [1.0.0] - 2026-11-22
### Added
- Database migration creating `audit_logs` table with composite indexes.
- `AuditService.log()` centralized logging pipeline supporting transactional and in-memory logging.
- `GET /api/v1/audit-logs` and `GET /api/v1/audit-logs/:id` admin query endpoints.
- Zod validation for query filters in `@campuscore/shared`.
- Vitest integration test suite in `backend/tests/audit.test.ts`.
- Full module documentation (API, Architecture, Contract, Database, Requirements, Security, Testing, Changelog, README).
