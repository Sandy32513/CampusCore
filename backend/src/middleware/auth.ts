import { Request, Response, NextFunction } from "express";
import { UserDto } from "@campuscore/shared";
import { AuthService } from "../services/authService.js";

// Express request augmentation requires declaration merging.
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: UserDto;
      sessionToken?: string;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export function extractSessionToken(req: Request): string | null {
  // 1. Check Cookie
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const c of cookies) {
      if (c.startsWith("campuscore_session=")) {
        return c.substring("campuscore_session=".length);
      }
    }
  }

  // 2. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  return null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractSessionToken(req);

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication required to access this resource"
      }
    });
    return;
  }

  let user: UserDto | null;
  try {
    user = await AuthService.validateSession(token);
  } catch (error) {
    next(error);
    return;
  }
  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: "INVALID_SESSION",
        message: "Your session is invalid or has expired. Please sign in again."
      }
    });
    return;
  }

  req.user = user;
  req.sessionToken = token;
  next();
}
