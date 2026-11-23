import { Router, Request, Response } from "express";
import { ApiResponse, loginSchema } from "@campuscore/shared";
import { AuthService } from "../services/authService.js";
import { requireAuth, extractSessionToken } from "../middleware/auth.js";
import { loginRateLimit } from "../middleware/authRateLimit.js";

export const authRouter = Router();

// POST /api/v1/auth/login
authRouter.post("/login", loginRateLimit, async (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid login credentials format",
        details: parseResult.error.issues.map((e) => ({
          field: e.path.join("."),
          issue: e.message
        }))
      }
    });
    return;
  }

  const { email, password } = parseResult.data;
  const result = await AuthService.login(email, password);

  if (!result) {
    res.status(401).json({
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password"
      }
    });
    return;
  }

  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("campuscore_session", result.rawToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: result.expiresAt
  });

  res.status(200).json({
    success: true,
    data: {
      user: result.user
    },
    message: "Login successful"
  });
});

// POST /api/v1/auth/logout
authRouter.post("/logout", requireAuth, async (req: Request, res: Response<ApiResponse<null>>) => {
  const token = extractSessionToken(req);
  if (token) {
    await AuthService.logout(token);
  }

  res.clearCookie("campuscore_session", { path: "/" });

  res.status(200).json({
    success: true,
    data: null,
    message: "Logged out successfully"
  });
});

// GET /api/v1/auth/me
authRouter.get("/me", requireAuth, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    },
    message: "User profile retrieved"
  });
});
