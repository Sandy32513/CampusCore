# V39 System Settings: Testing Specification

## 1. Test Strategy
- Public endpoint security: verify unauthenticated access returns public branding while omitting private configuration keys (e.g. `session_timeout_minutes`).
- Privilege boundary verification: verify non-super-admin roles receive HTTP 403 Forbidden on update attempts.
- State mutation verification: verify updates to settings are immediately visible in both full settings map and public DTO.
- Audit integration: verify changes emit tamper-evident audit events in V38 Audit Logs.

## 2. Test Cases Covered in `backend/tests/settings.test.ts`
- `GET /api/v1/settings/public`: Returns public metadata without authentication.
- `GET /api/v1/settings`: Returns full settings map for authenticated users.
- `PUT /api/v1/settings as Student`: Rejected with 403 Forbidden.
- `PUT /api/v1/settings as Super Admin`: Updates configuration and emits audit event.
