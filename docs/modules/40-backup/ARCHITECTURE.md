# V40 — Database Backup & Recovery: Architecture

## Architectural Flow
```
Client Request (Manual UI / Automated Schedule)
   ↓
Authentication Middleware (requireAuth)
   ↓
RBAC Authorization (requireRole: SUPER_ADMIN)
   ↓
BackupService
   ↓
Filesystem (`./storage/backups/<filename>.sql`)
   ↓
Crypto (SHA-256 Digest Calculation)
   ↓
MySQL 8.4 LTS (`database_backups` table)
   ↓
AuditService (V38 transactional audit record emitted)
   ↓
Structured ApiResponse<BackupRecordDto>
```
