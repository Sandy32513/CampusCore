# V40 — Database Backup & Recovery: Contract

## TypeScript Interfaces (`@campuscore/shared`)

```typescript
export type BackupType = "FULL" | "INCREMENTAL" | "SCHEMA_ONLY";
export type BackupStatus = "PENDING" | "COMPLETED" | "FAILED" | "RESTORED";

export interface BackupRecordDto {
  id: string;
  filename: string;
  filepath: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  backupType: BackupType;
  status: BackupStatus;
  checksumSha256?: string | null;
  createdByUserId?: string | null;
  createdByUserEmail?: string | null;
  retentionDays: number;
  notes?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface VerifyBackupResultDto {
  id: string;
  filename: string;
  exists: boolean;
  fileSizeBytes: number;
  expectedChecksum?: string | null;
  actualChecksum?: string | null;
  isValid: boolean;
  verifiedAt: string;
}

export interface RestoreBackupResultDto {
  id: string;
  filename: string;
  restored: boolean;
  message: string;
  restoredAt: string;
}
```
