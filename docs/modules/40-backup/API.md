# V40 — Database Backup & Recovery: API Specification

## Endpoints

### 1. List Backups
`GET /api/v1/backups`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Query Parameters:** `page`, `pageSize`, `status`, `backupType`
- **Status:** 200 OK

### 2. Trigger Backup
`POST /api/v1/backups`
- **Access:** `SUPER_ADMIN`
- **Body:** `{ "backupType": "FULL", "retentionDays": 30, "notes": "string" }`
- **Status:** 201 Created

### 3. Verify Backup Integrity
`GET /api/v1/backups/:id/verify`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Status:** 200 OK / 404 Not Found

### 4. Restore Database from Backup
`POST /api/v1/backups/:id/restore`
- **Access:** `SUPER_ADMIN`
- **Status:** 200 OK / 422 Unprocessable Entity

### 5. Delete Backup
`DELETE /api/v1/backups/:id`
- **Access:** `SUPER_ADMIN`
- **Status:** 200 OK / 404 Not Found
