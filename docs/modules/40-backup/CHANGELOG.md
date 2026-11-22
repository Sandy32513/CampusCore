# V40 — Database Backup & Recovery: Changelog

## [40.0.0] - 2026-11-22
### Added
- Created `database_backups` MySQL 8.4 LTS table with file metadata and SHA-256 integrity checksums.
- Defined `BackupRecordDto`, `VerifyBackupResultDto`, `RestoreBackupResultDto` in `@campuscore/shared`.
- Implemented `BackupService` with automated dump, checksum hashing, disk verification, and restore simulation.
- Exposed RESTful endpoints at `/api/v1/backups`.
- Added Backups & Recovery live view in `frontend/public/index.html`.
- Implemented 6 Vitest integration tests in `backend/tests/backups.test.ts`.
- Module frozen with tag `v40.0.0-backup-recovery`.
