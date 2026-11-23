import type { NextFunction, Request, Response } from "express";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const MAX_TRACKED_IPS = 20_000;

interface AttemptWindow {
  count: number;
  resetAt: number;
}

const attemptsByIp = new Map<string, AttemptWindow>();
let checksSinceCleanup = 0;

export function loginRateLimit(req: Request, res: Response, next: NextFunction): void {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  let window = attemptsByIp.get(key);

  if (window && window.resetAt <= now) {
    attemptsByIp.delete(key);
    window = undefined;
  }

  if (!window && attemptsByIp.size >= MAX_TRACKED_IPS) {
    res.status(503).json({
      success: false,
      error: { code: "AUTH_CAPACITY", message: "Login protection is temporarily at capacity" }
    });
    return;
  }

  if (!window) {
    window = { count: 0, resetAt: now + WINDOW_MS };
    attemptsByIp.set(key, window);
  }

  if (window.count >= MAX_ATTEMPTS) {
    res.setHeader("Retry-After", String(Math.max(1, Math.ceil((window.resetAt - now) / 1000))));
    res.status(429).json({
      success: false,
      error: { code: "RATE_LIMITED", message: "Too many login attempts; try again later" }
    });
    return;
  }

  window.count += 1;
  res.once("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) attemptsByIp.delete(key);
  });

  checksSinceCleanup += 1;
  if (checksSinceCleanup >= 256) {
    checksSinceCleanup = 0;
    for (const [ip, record] of attemptsByIp) {
      if (record.resetAt <= now) attemptsByIp.delete(ip);
    }
  }

  next();
}
