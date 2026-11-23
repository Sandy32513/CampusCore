# V4 — Student Management: Changelog

## [4.0.1] - 2026-11-23 (audit patch, validation partial)
### Security
- Scoped student list and detail reads for `STUDENT` accounts to their linked `user_id`.
- Denied `PARENT` reads until a verified consent-backed guardian/student relationship exists; V6 remains a prerequisite.
- Added route authorization and query-scope unit checks under CC-F-305 (commit `bed27d9`, tag `v4.0.1-students`). MySQL integration validation remains blocked.

## [4.0.0] - 2026-11-22
### Added
- Created `students` MySQL 8.4 LTS table with enforced foreign keys to `users`, `departments`, `courses`, `semesters`.
- Defined `StudentDto`, `CreateStudentSchema`, `UpdateStudentSchema`, `QueryStudentsSchema` in `@campuscore/shared`.
- Implemented `StudentService` with MySQL query builder and transactional audit logging.
- Exposed RESTful endpoints at `/api/v1/students`.
- Developed live interactive Student Management UI and modal in `frontend/public/index.html`.
- Implemented 8 comprehensive Vitest integration tests in `backend/tests/students.test.ts`.
- Module frozen with tag `v4.0.0-students`.
