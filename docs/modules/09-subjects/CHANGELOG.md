# V9 — Subject Management: Changelog

## [9.0.0] - 2026-11-22
### Added
- Created `subjects` and `course_subjects` MySQL 8.4 LTS tables.
- Defined `SubjectDto`, `CourseSubjectMappingDto`, schemas in `@campuscore/shared`.
- Implemented `SubjectService` with course mapping and audit log tracking.
- Exposed RESTful endpoints at `/api/v1/subjects`.
- Added Subject Catalog live view and modal in `frontend/public/index.html`.
- Implemented 9 Vitest integration tests in `backend/tests/subjects.test.ts`.
- Module frozen with tag `v9.0.0-subjects`.
