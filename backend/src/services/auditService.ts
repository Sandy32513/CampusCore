import type { AuditLogDto, QueryAuditLogsInput } from "@campuscore/shared";
import type { Knex } from "knex";
import { getDb } from "../db/connection.js";

export interface CreateAuditLogEvent {
  userId?: string | null;
  userEmail?: string | null;
  role?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status?: "SUCCESS" | "FAILURE" | "WARNING";
}

interface AuditLogRow {
  id: number | string;
  user_id: number | string | null;
  user_email: string | null;
  role: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: Record<string, unknown> | string | null;
  ip_address: string | null;
  user_agent: string | null;
  status: AuditLogDto["status"];
  created_at: string | Date;
}

function toAuditLogDto(row: AuditLogRow): AuditLogDto {
  return {
    id: String(row.id),
    userId: row.user_id === null ? null : String(row.user_id),
    userEmail: row.user_email,
    role: row.role,
    action: row.action,
    entity: row.entity,
    entityId: row.entity_id,
    details: typeof row.details === "string" ? JSON.parse(row.details) : row.details,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString()
  };
}

export class AuditService {
  static async log(event: CreateAuditLogEvent, trx?: Knex.Transaction): Promise<AuditLogDto> {
    const db = trx || getDb();
    const [insertId] = await db("audit_logs").insert({
      user_id: event.userId ? Number(event.userId) : null,
      user_email: event.userEmail ?? null,
      role: event.role ?? null,
      action: event.action,
      entity: event.entity,
      entity_id: event.entityId ?? null,
      details: event.details ? JSON.stringify(event.details) : null,
      ip_address: event.ipAddress ?? null,
      user_agent: event.userAgent ?? null,
      status: event.status ?? "SUCCESS"
    });
    const row = await db("audit_logs").where({ id: insertId }).first();
    if (!row) throw new Error("The audit event could not be loaded after insertion");
    return toAuditLogDto(row as AuditLogRow);
  }

  static async listLogs(query: QueryAuditLogsInput): Promise<{ logs: AuditLogDto[]; total: number }> {
    const { page, pageSize, userId, action, entity, status, startDate, endDate, q } = query;
    const db = getDb();
    let dbQuery = db("audit_logs");

    if (userId) dbQuery = dbQuery.where("user_id", Number(userId));
    if (action) dbQuery = dbQuery.where("action", action);
    if (entity) dbQuery = dbQuery.where("entity", entity);
    if (status) dbQuery = dbQuery.where("status", status);
    if (startDate) dbQuery = dbQuery.where("created_at", ">=", startDate);
    if (endDate) dbQuery = dbQuery.where("created_at", "<=", endDate);
    if (q) {
      dbQuery = dbQuery.where((builder) => {
        builder.where("action", "like", `%${q}%`)
          .orWhere("entity", "like", `%${q}%`)
          .orWhere("user_email", "like", `%${q}%`)
          .orWhere("entity_id", "like", `%${q}%`);
      });
    }

    const totalResult = await dbQuery.clone().count<{ count: number }>("id as count").first();
    const total = Number(totalResult?.count || 0);
    const rows = await dbQuery
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy("id", "desc");
    return { logs: rows.map((row) => toAuditLogDto(row as AuditLogRow)), total };
  }

  static async getLogById(id: string): Promise<AuditLogDto | null> {
    const row = await getDb()("audit_logs").where({ id }).first();
    return row ? toAuditLogDto(row as AuditLogRow) : null;
  }
}
