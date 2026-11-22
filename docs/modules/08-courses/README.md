# V8 — Course Management

## Module Overview
Course Management delivers academic program and degree governance:
- Degree and certificate cataloging with department foreign key mapping (`ON DELETE RESTRICT`).
- Duration tracking (in years), total credit requirements, and degree classifications (`UNDERGRADUATE`, `POSTGRADUATE`, `DIPLOMA`, `CERTIFICATE`).
- Enrolled student count, teacher count, and subject count relational aggregations.
- Deactivation status lifecycle safeguards.
- Full audit event logging via V38.

## Direct Dependencies
- **Upstream:** V0 Foundation, V2 Authentication, V3 User Management, V7 Department Management.
- **Downstream:** V4 Student Lifecycle, V9 Subject Management, V11 Class/Section, V14 Enrollment, V24 Fees.

## API Summary
- `GET /api/v1/courses`: Paginated list of courses with department joins.
- `POST /api/v1/courses`: Create course (`SUPER_ADMIN`, `ADMIN`).
- `GET /api/v1/courses/:id`: Course details with statistics.
- `PUT /api/v1/courses/:id`: Update course metadata.
- `PATCH /api/v1/courses/:id/status`: Toggle active status.

## Verification
Integration tests in `backend/tests/courses.test.ts`.
Status: **FROZEN** (`v8.0.0-courses`).
