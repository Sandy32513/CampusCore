# V7 — Department Management

## Module Overview
Department Management delivers institutional departmental governance:
- Core department catalog with uppercase unique department codes (e.g. `CSE`, `ECE`, `MECH`).
- Head of Department (HOD) assignments.
- Real-time statistics aggregation (course count, faculty count, enrolled student count).
- Status toggling with deactivation safeguards.
- Full audit event logging via V38.

## Direct Dependencies
- **Upstream:** V0 Project Foundation, V2 Authentication, V3 User Management.
- **Downstream:** V8 Course Management, V4 Student Lifecycle.

## API Summary
- `GET /api/v1/departments`: Paginated list of departments.
- `POST /api/v1/departments`: Create department (`SUPER_ADMIN`, `ADMIN`).
- `GET /api/v1/departments/:id`: Department details with statistics.
- `PUT /api/v1/departments/:id`: Update department details.
- `PATCH /api/v1/departments/:id/status`: Toggle active status.

## Verification
Integration tests in `backend/tests/departments.test.ts`.
Status: **FROZEN** (`v7.0.0-departments`).
