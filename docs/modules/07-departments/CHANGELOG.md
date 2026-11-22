# V7 Department Management: Changelog

## [1.0.0] - 2026-11-22
### Added
- Core `departments` MySQL schema with unique code constraints and indexing.
- Zod validation schemas (`createDepartmentSchema`, `updateDepartmentSchema`, `queryDepartmentsSchema`) in `@campuscore/shared`.
- `DepartmentService` with database queries and memory fallback.
- Express endpoints for list, get, create, update, and status toggling under `/api/v1/departments`.
- Integration tests in `backend/tests/departments.test.ts`.
- Full module documentation (API, Architecture, Contract, Database, Requirements, Security, Testing, Changelog, README).
