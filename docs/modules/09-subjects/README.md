# V9 — Subject Management

## Module Overview
Subject Management provides curriculum management and academic subject governance:
- Comprehensive subject cataloging with unique subject codes (e.g. `CS101-TH`, `MA101-TH`).
- Department association with `departments.id` (`ON DELETE RESTRICT`).
- Theory and practical credit tracking, total credit calculation, elective vs core classification.
- Subject classification: `THEORY`, `PRACTICAL`, `LAB`, `SEMINAR`, `PROJECT`.
- Mapping subjects to program courses and specific semester numbers via `course_subjects` junction table.
- Audit logging for all subject catalog modifications.

## Direct Dependencies
- **Upstream:** V0 Foundation, V2 Authentication, V3 Users & Roles, V7 Departments, V8 Courses, V10 Academic Calendar.
- **Downstream:** V12 Teachers, V13 Teacher Assignment, V18 Examinations, V19 Marks, V22 Study Materials.

## API Summary
- `GET /api/v1/subjects`: Paginated search, filtered by department, course, type, elective, status.
- `POST /api/v1/subjects`: Create subject (`SUPER_ADMIN`, `ADMIN`).
- `GET /api/v1/subjects/:id`: Subject details with mapped courses.
- `PUT /api/v1/subjects/:id`: Update subject metadata (`SUPER_ADMIN`, `ADMIN`).
- `PATCH /api/v1/subjects/:id/status`: Toggle active status (`SUPER_ADMIN`, `ADMIN`).
- `POST /api/v1/subjects/:id/courses`: Map subject to course semester curriculum (`SUPER_ADMIN`, `ADMIN`).
- `DELETE /api/v1/subjects/:id/courses/:courseId`: Unmap subject from course curriculum (`SUPER_ADMIN`, `ADMIN`).

## Status
Status: **FROZEN** (`v9.0.0-subjects`).
