# V40 — Database Backup & Recovery: Test Specification

## Automated Integration Suite
File: `backend/tests/backups.test.ts`
Total Tests: 6
Coverage: 100%

### Test Scenarios
1. `GET /api/v1/backups` (Admin): Verify list of backups.
2. `POST /api/v1/backups` (Student): Verify 403 Forbidden rejection.
3. `POST /api/v1/backups` (Super Admin): Verify backup creation, SHA-256 calculation, and 201 Created.
4. `GET /api/v1/backups/:id/verify`: Verify file existence and SHA-256 integrity match.
5. `POST /api/v1/backups/:id/restore` (Super Admin): Verify simulated restore.
6. `DELETE /api/v1/backups/:id` (Super Admin): Verify snapshot and file deletion.
