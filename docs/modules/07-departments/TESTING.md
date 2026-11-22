# V7 Department Management: Testing Specification

## 1. Test Strategy
- Integration testing using Vitest and Supertest against Express REST endpoints.
- Verification of uppercase normalization for department codes.
- Duplicate department code collision prevention.
- Authorization matrix: Admin vs Student access boundaries.
- Relational stats integrity and audit log emissions.

## 2. Test Cases Covered in `backend/tests/departments.test.ts`
- `GET /api/v1/departments`: Lists seeded and newly created departments.
- `POST /api/v1/departments as Student`: Rejected with 403 Forbidden.
- `POST /api/v1/departments as Admin`: Successfully creates department, normalizes code to uppercase.
- `POST /api/v1/departments duplicate`: Rejects duplicate code with 409 Conflict.
- `GET /api/v1/departments/:id`: Returns department entity with statistics object.
- `PUT /api/v1/departments/:id`: Updates department details and emits audit event.
- `PATCH /api/v1/departments/:id/status`: Deactivates/activates department.
