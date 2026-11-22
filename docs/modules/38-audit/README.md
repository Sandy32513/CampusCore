# V38 — Audit Logs

## Module Overview
Audit Logs delivers universal tamper-evident event auditing across the entire SMS:
- Centralized audit logging pipeline `AuditService.log()`.
- Captures actor identity, action verb, target entity, entity identifier, metadata diffs, client IP address, and status.
- Strictly append-only: immutable event stream with no external update or deletion routes.
- Admin query interface with filtering by actor, entity, date ranges, and full-text keyword search.

## Direct Dependencies
- **Upstream:** V0 Project Foundation, V2 Authentication, V3 User Management.
- **Downstream:** Consumed universally across all modules (V7, V10, V4, V8, V11, etc.).

## API Summary
- `GET /api/v1/audit-logs`: Paginated inquiry into audit logs (`SUPER_ADMIN`, `ADMIN`).
- `GET /api/v1/audit-logs/:id`: Fetch specific log event by ID.

## Verification
Integration tests in `backend/tests/audit.test.ts`.
Status: **FROZEN** (`v38.0.0-audit-logs`).
