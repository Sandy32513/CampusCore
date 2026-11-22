# V8 Course Management: Changelog

## [1.0.0] - 2026-11-22
### Added
- Database migration creating `courses` relational table with foreign key to `departments`.
- Zod validation schemas (`createCourseSchema`, `updateCourseSchema`, `queryCoursesSchema`) in `@campuscore/shared`.
- `CourseService` with department integrity checks and memory fallback.
- REST endpoints under `/api/v1/courses`.
- Vitest integration tests in `backend/tests/courses.test.ts`.
- Full module documentation (API, Architecture, Contract, Database, Requirements, Security, Testing, Changelog, README).
