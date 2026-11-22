import { z } from "zod";

export const BackupTypeSchema = z.enum(["FULL", "INCREMENTAL", "SCHEMA_ONLY"]);
export const BackupStatusSchema = z.enum(["PENDING", "COMPLETED", "FAILED", "RESTORED"]);

export const CreateBackupSchema = z.object({
  backupType: BackupTypeSchema.default("FULL"),
  retentionDays: z.coerce.number().min(1).max(365).default(30),
  notes: z.string().max(1000).optional().nullable()
});

export const QueryBackupsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: BackupStatusSchema.optional(),
  backupType: BackupTypeSchema.optional()
});
