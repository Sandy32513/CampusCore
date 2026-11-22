# V10 Academic Year & Semester: Changelog

## [1.0.0] - 2026-11-22
### Added
- Database migration creating `academic_years` and `semesters` relational tables.
- Zod schemas for academic years and semesters validation with date boundary enforcement.
- `AcademicService` with atomic current/active toggling logic.
- REST endpoints for academic years and semesters under `/api/v1/academic-years` and `/api/v1/semesters`.
- Vitest integration tests in `backend/tests/academic.test.ts`.
- Full module documentation (API, Architecture, Contract, Database, Requirements, Security, Testing, Changelog, README).
