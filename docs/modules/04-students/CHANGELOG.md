# V4 — Student Management: Changelog

## [4.0.0] - 2026-11-22
### Added
- Created `students` MySQL 8.4 LTS table with enforced foreign keys to `users`, `departments`, `courses`, `semesters`.
- Defined `StudentDto`, `CreateStudentSchema`, `UpdateStudentSchema`, `QueryStudentsSchema` in `@campuscore/shared`.
- Implemented `StudentService` with MySQL query builder and transactional audit logging.
- Exposed RESTful endpoints at `/api/v1/students`.
- Developed live interactive Student Management UI and modal in `frontend/public/index.html`.
- Implemented 8 comprehensive Vitest integration tests in `backend/tests/students.test.ts`.
- Module frozen with tag `v4.0.0-students`.
