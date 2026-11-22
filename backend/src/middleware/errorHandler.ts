import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse } from "@campuscore/shared";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
) {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected error occurred",
      requestId: _req.headers["x-request-id"] as string | undefined
    }
  });
}
