import { AuditLogDto, QueryAuditLogsInput } from "@campuscore/shared";
import { getDb } from "../db/connection.js";
import { Knex } from "knex";

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

export const inMemoryAuditLogs: AuditLogDto[] = [
  {
    id: "1",
    userId: "1",
    userEmail: "admin@campuscore.edu",
    role: "SUPER_ADMIN",
    action: "SYSTEM_BOOTSTRAP",
    entity: "SYSTEM",
    entityId: "1",
    details: { message: "System initialized and ready" },
    ipAddress: "127.0.0.1",
    userAgent: "System/Init",
    status: "SUCCESS",
    createdAt: new Date().toISOString()
  }
];
let nextAuditId = 2;

export class AuditService {
  static async log(event: CreateAuditLogEvent, trx?: Knex.Transaction): Promise<AuditLogDto> {
    const logEntry: AuditLogDto = {
      id: String(nextAuditId++),
      userId: event.userId ?? null,
      userEmail: event.userEmail ?? null,
      role: event.role ?? null,
      action: event.action,
      entity: event.entity,
      entityId: event.entityId ?? null,
      details: event.details ?? null,
      ipAddress: event.ipAddress ?? null,
      userAgent: event.userAgent ?? null,
      status: event.status ?? "SUCCESS",
      createdAt: new Date().toISOString()
    };

    // 1. Try DB
    try {
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
      if (insertId) {
        logEntry.id = String(insertId);
      }
    } catch {
      // Memory fallback
    }

    inMemoryAuditLogs.unshift(logEntry);
    return logEntry;
  }

  static async listLogs(query: QueryAuditLogsInput): Promise<{ logs: AuditLogDto[]; total: number }> {
    const { page, pageSize, userId, action, entity, status, startDate, endDate, q } = query;

    // 1. Try DB
    try {
      const db = getDb();
      let dbQuery = db("audit_logs");

      if (userId) dbQuery = dbQuery.where("user_id", Number(userId));
      if (action) dbQuery = dbQuery.where("action", action);
      if (entity) dbQuery = dbQuery.where("entity", entity);
      if (status) dbQuery = dbQuery.where("status", status);
      if (startDate) dbQuery = dbQuery.where("created_at", ">=", startDate);
      if (endDate) dbQuery = dbQuery.where("created_at", "<=", endDate);
      if (q) {
        dbQuery = dbQuery.where((b) => {
          b.where("action", "like", `%${q}%`)
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

      const logs: AuditLogDto[] = rows.map((r) => ({
        id: String(r.id),
        userId: r.user_id ? String(r.user_id) : null,
        userEmail: r.user_email,
        role: r.role,
        action: r.action,
        entity: r.entity,
        entityId: r.entity_id,
        details: typeof r.details === "string" ? JSON.parse(r.details) : r.details,
        ipAddress: r.ip_address,
        userAgent: r.user_agent,
        status: r.status,
        createdAt: new Date(r.created_at).toISOString()
      }));

      return { logs, total };
    } catch {
      // Memory fallback
    }

    // 2. Memory store
    let filtered = [...inMemoryAuditLogs];
    if (userId) filtered = filtered.filter((l) => l.userId === userId);
    if (action) filtered = filtered.filter((l) => l.action.toLowerCase() === action.toLowerCase());
    if (entity) filtered = filtered.filter((l) => l.entity.toLowerCase() === entity.toLowerCase());
    if (status) filtered = filtered.filter((l) => l.status === status);
    if (startDate) filtered = filtered.filter((l) => new Date(l.createdAt) >= new Date(startDate));
    if (endDate) filtered = filtered.filter((l) => new Date(l.createdAt) <= new Date(endDate));
    if (q) {
      const qLower = q.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.action.toLowerCase().includes(qLower) ||
          l.entity.toLowerCase().includes(qLower) ||
          (l.userEmail && l.userEmail.toLowerCase().includes(qLower)) ||
          (l.entityId && l.entityId.toLowerCase().includes(qLower))
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return { logs: paginated, total };
  }

  static async getLogById(id: string): Promise<AuditLogDto | null> {
    try {
      const db = getDb();
      const row = await db("audit_logs").where({ id }).first();
      if (row) {
        return {
          id: String(row.id),
          userId: row.user_id ? String(row.user_id) : null,
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
    } catch {
      // Memory fallback
    }

    const found = inMemoryAuditLogs.find((l) => l.id === id);
    return found || null;
  }
}
