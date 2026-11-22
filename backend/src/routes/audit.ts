import { Router, Request, Response } from "express";
import { queryAuditLogsSchema } from "@campuscore/shared";
import { AuditService } from "../services/auditService.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

export const auditRouter = Router();

// Universal security guard: Audit logs accessible by Administrators only
auditRouter.use(requireAuth);
auditRouter.use(requireRole(["SUPER_ADMIN", "ADMIN"]));

// GET /api/v1/audit-logs
auditRouter.get("/", async (req: Request, res: Response) => {
  const queryResult = queryAuditLogsSchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid query parameters" }
    });
    return;
  }

  const { logs, total } = await AuditService.listLogs(queryResult.data);
  const totalPages = Math.ceil(total / queryResult.data.pageSize) || 1;

  res.status(200).json({
    success: true,
    data: { logs },
    meta: {
      page: queryResult.data.page,
      pageSize: queryResult.data.pageSize,
      total,
      totalPages
    },
    message: "Audit logs retrieved successfully"
  });
});

// GET /api/v1/audit-logs/:id
auditRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const log = await AuditService.getLogById(id);

  if (!log) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Audit log entry not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { log },
    message: "Audit log retrieved successfully"
  });
});
