# V0 Foundation: Testing Documentation

## 1. Test Strategy
- **Unit & Integration Tests:** Vitest & Supertest
- **Scope:**
  - Route availability on `/health` and `/api/v1/health`
  - Strict response payload adherence to `ApiResponse<HealthStatusData>` envelope
  - Error middleware formatting for unexpected errors

## 2. Test Execution
```bash
npm test --workspace=backend
```
Expected output:
- `health.test.ts` passes all test cases with 0 failures.
