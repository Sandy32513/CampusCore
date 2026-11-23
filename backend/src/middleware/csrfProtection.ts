import type { NextFunction, Request, Response } from "express";
import { config } from "../config/env.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  if (req.get("sec-fetch-site") === "cross-site") {
    reject(res);
    return;
  }

  const origin = req.get("origin");
  if (origin) {
    let normalizedOrigin: string;
    try {
      normalizedOrigin = new URL(origin).origin;
    } catch {
      reject(res);
      return;
    }

    if (!config.corsOrigins.includes(normalizedOrigin) || req.get("x-csrf-protection") !== "1") {
      reject(res);
      return;
    }
  }

  next();
}

function reject(res: Response): void {
  res.status(403).json({
    success: false,
    error: { code: "CSRF_REJECTED", message: "Request origin could not be verified" }
  });
}
