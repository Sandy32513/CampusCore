import { Router, Request, Response } from "express";
import {
  CreateBackupSchema,
  QueryBackupsSchema
} from "@campuscore/shared";
import { BackupService } from "../services/backupService.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

export const backupsRouter = Router();

backupsRouter.use(requireAuth);

// GET /api/v1/backups (Admin & Super Admin)
backupsRouter.get("/", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const queryResult = QueryBackupsSchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid backup query parameters" }
    });
    return;
  }

  const { backups, total } = await BackupService.listBackups(queryResult.data);
  const totalPages = Math.ceil(total / queryResult.data.pageSize) || 1;

  res.status(200).json({
    success: true,
    data: { backups },
    meta: {
      page: queryResult.data.page,
      pageSize: queryResult.data.pageSize,
      total,
      totalPages
    },
    message: "Database backups retrieved successfully"
  });
});

// POST /api/v1/backups (Super Admin only)
backupsRouter.post("/", requireRole(["SUPER_ADMIN"]), async (req: Request, res: Response) => {
  const parseResult = CreateBackupSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid backup parameters" }
    });
    return;
  }

  const result = await BackupService.createBackup(parseResult.data, {
    user: (req as any).user,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  if (result.error) {
    res.status(500).json({
      success: false,
      error: { code: "BACKUP_FAILED", message: result.error }
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: { backup: result.backup },
    message: "Automated MySQL database backup completed successfully"
  });
});

// GET /api/v1/backups/:id/verify (Admin & Super Admin)
backupsRouter.get("/:id/verify", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const verification = await BackupService.verifyBackup(req.params.id);
  if (!verification) {
    res.status(404).json({
      success: false,
      error: { code: "BACKUP_NOT_FOUND", message: "Backup snapshot not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { verification },
    message: verification.isValid ? "Backup file integrity verified successfully" : "Integrity verification failed"
  });
});

// POST /api/v1/backups/:id/restore (Super Admin only)
backupsRouter.post("/:id/restore", requireRole(["SUPER_ADMIN"]), async (req: Request, res: Response) => {
  const result = await BackupService.restoreBackup(req.params.id, {
    user: (req as any).user,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  if (!result) {
    res.status(404).json({
      success: false,
      error: { code: "BACKUP_NOT_FOUND", message: "Backup snapshot not found" }
    });
    return;
  }

  if (!result.restored) {
    res.status(422).json({
      success: false,
      error: { code: "RESTORE_VERIFICATION_FAILED", message: result.message }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { restoreResult: result },
    message: result.message
  });
});

// DELETE /api/v1/backups/:id (Super Admin only)
backupsRouter.delete("/:id", requireRole(["SUPER_ADMIN"]), async (req: Request, res: Response) => {
  const result = await BackupService.deleteBackup(req.params.id, {
    user: (req as any).user,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  if (!result.success) {
    res.status(404).json({
      success: false,
      error: { code: "BACKUP_NOT_FOUND", message: "Backup snapshot not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Backup file and record deleted successfully"
  });
});
