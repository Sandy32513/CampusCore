export interface AuditLogDto {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  role?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: "SUCCESS" | "FAILURE" | "WARNING";
  createdAt: string;
}
