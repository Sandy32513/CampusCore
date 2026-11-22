# V10 — Academic Year & Semester

## Module Overview
Academic Year & Semester management delivers institutional academic calendar governance:
- Definition of academic cycles (e.g. 2026-2027) with date boundaries (`start_date < end_date`).
- Single active current academic year invariant.
- Term / Semester management bounded within academic year dates.
- Single operational active semester invariant.
- Historical semester locking mechanism.
- Full audit event logging via V38.

## Direct Dependencies
- **Upstream:** V0 Foundation, V2 Authentication, V3 User Management.
- **Downstream:** V4 Student Lifecycle, V8 Course Management, V11 Class/Section, V14 Student Enrollment.

## API Summary
- `GET /api/v1/academic-years`: List academic years with semesters summary.
- `GET /api/v1/academic-years/current`: Fetch current active academic cycle.
- `POST /api/v1/academic-years`: Create academic year (`SUPER_ADMIN`, `ADMIN`).
- `PUT /api/v1/academic-years/:id`: Update academic year details.
- `PATCH /api/v1/academic-years/:id/set-current`: Atomically set target year as current.
- `GET /api/v1/academic-years/:yearId/semesters`: List semesters for academic year.
- `POST /api/v1/academic-years/:yearId/semesters`: Create semester.
- `PUT /api/v1/semesters/:id`: Update semester.
- `PATCH /api/v1/semesters/:id/activate`: Atomically activate operational semester.

## Verification
Integration tests in `backend/tests/academic.test.ts`.
Status: **FROZEN** (`v10.0.0-academic-years`).
