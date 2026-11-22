import { Router, Request, Response } from "express";
import { ApiResponse, HealthStatusData } from "@campuscore/shared";
import { checkDatabaseHealth } from "../db/connection.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req: Request, res: Response<ApiResponse<HealthStatusData>>) => {
  const isDbConnected = await checkDatabaseHealth();
  const uptime = process.uptime();

  const data: HealthStatusData = {
    status: isDbConnected ? "healthy" : "degraded",
    database: isDbConnected ? "connected" : "disconnected",
    version: "0.0.0",
    uptime: Math.round(uptime * 100) / 100,
    timestamp: new Date().toISOString()
  };

  res.status(200).json({
    success: true,
    data,
    message: isDbConnected
      ? "CampusCore SMS backend is healthy"
      : "CampusCore SMS backend running (database disconnected)"
  });
});
