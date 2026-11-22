# V2 Authentication: Testing Documentation

## 1. Test Strategy
- **Suite:** `backend/tests/auth.test.ts` (Vitest & Supertest)
- **Scenarios Covered:**
  - Login success: HTTP 200, valid user payload, `httpOnly` cookie set.
  - Invalid password: HTTP 401 with generic error message.
  - Unknown email: HTTP 401 with generic error message (preventing username enumeration).
  - Validation error: HTTP 400 for malformed emails or short passwords.
  - Unauthenticated `/me`: HTTP 401 when no session cookie is provided.
  - Complete lifecycle: Login -> Session verify -> Logout -> Session revocation confirmation.

## 2. Test Execution
```bash
npm test --workspace=@campuscore/backend
```
Expected output:
- `tests/auth.test.ts`: 6 passed
- `tests/modules.test.ts`: 3 passed
- `tests/health.test.ts`: 2 passed
- **Total: 11 passed, 0 failed.**
