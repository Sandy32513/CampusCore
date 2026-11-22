# V3 User & Role Management: Testing Documentation

## 1. Test Strategy
- **Integration Tests:** `backend/tests/users.test.ts` (Vitest & Supertest)
- **Scenarios Verified:**
  - `GET /api/v1/users` as Admin returns paginated results.
  - `GET /api/v1/users` as Student returns `403 Forbidden`.
  - `POST /api/v1/users` creates users with valid role and no password hash exposure.
  - `POST /api/v1/users` duplicate email returns `409 Conflict`.
  - `PUT /api/v1/users/:id` updates profile data.
  - `PATCH /api/v1/users/:id/status` deactivates user and immediately revokes active sessions.
  - `PATCH /api/v1/users/:id/status` self-deactivation attempt returns `400 Bad Request`.
  - `POST /api/v1/users/:id/reset-password` resets password and revokes sessions.
  - `GET /api/v1/roles` returns all 6 canonical roles.

## 2. Test Execution
```bash
npm test --workspace=@campuscore/backend
```
Expected output:
- `tests/users.test.ts`: 9 passed
- `tests/auth.test.ts`: 6 passed
- `tests/modules.test.ts`: 3 passed
- `tests/health.test.ts`: 2 passed
- **Total: 20 passed, 0 failed.**
