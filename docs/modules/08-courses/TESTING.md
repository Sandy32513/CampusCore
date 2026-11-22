# V8 Course Management: Testing Specification

## 1. Test Strategy
- Integration testing using Vitest and Supertest against REST API endpoints.
- Department mapping verification: reject invalid department IDs with HTTP 404.
- Code uppercase normalization and duplicate code prevention (HTTP 409).
- Role-based authorization matrix: Admins can mutate courses; students have read-only access.
- Relational statistics verification (student, teacher, and subject counters).

## 2. Test Cases Covered in `backend/tests/courses.test.ts`
- `GET /api/v1/courses`: Returns list with department joins.
- `POST /api/v1/courses as Student`: Rejected with 403 Forbidden.
- `POST /api/v1/courses with invalid department`: 404 Department Not Found.
- `POST /api/v1/courses as Admin`: Successfully creates course with normalized code.
- `POST /api/v1/courses duplicate`: 409 Conflict.
- `GET /api/v1/courses/:id`: Returns course with department info and stats.
- `PUT /api/v1/courses/:id`: Updates course metadata and emits V38 audit event.
- `PATCH /api/v1/courses/:id/status`: Deactivates/activates course.
