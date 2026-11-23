import { Router, Request, Response } from "express";
import { updateSettingsSchema } from "@campuscore/shared";
import { SettingsService } from "../services/settingsService.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

export const settingsRouter = Router();

// GET /api/v1/settings/public (Open to public, unauthenticated)
settingsRouter.get("/public", async (_req: Request, res: Response) => {
  const publicSettings = await SettingsService.getPublicSettings();
  res.status(200).json({
    success: true,
    data: { settings: publicSettings },
    message: "Public settings retrieved successfully"
  });
});

// Authenticated endpoints below
settingsRouter.use(requireAuth);

// GET /api/v1/settings (All authenticated users can read configuration)
settingsRouter.get("/", async (_req: Request, res: Response) => {
  const settings = await SettingsService.getAllSettings();
  res.status(200).json({
    success: true,
    data: { settings },
    message: "System settings retrieved successfully"
  });
});

// PUT /api/v1/settings (SUPER_ADMIN only)
settingsRouter.put("/", requireRole(["SUPER_ADMIN"]), async (req: Request, res: Response) => {
  const parseResult = updateSettingsSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid settings payload" }
    });
    return;
  }

  const updatedSettings = await SettingsService.updateSettings(parseResult.data, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  res.status(200).json({
    success: true,
    data: { settings: updatedSettings },
    message: "System settings updated successfully"
  });
});
