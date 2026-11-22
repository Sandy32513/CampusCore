import { Router, Request, Response } from "express";
import { createUserSchema, updateUserSchema, updateStatusSchema, queryUsersSchema } from "@campuscore/shared";
import { UserService } from "../services/userService.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

export const usersRouter = Router();

// Require authenticated session for all /users endpoints
usersRouter.use(requireAuth);

// GET /api/v1/users (Admin only)
usersRouter.get("/", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const queryResult = queryUsersSchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid query parameters" }
    });
    return;
  }

  const { users, total } = await UserService.listUsers(queryResult.data);
  const totalPages = Math.ceil(total / queryResult.data.pageSize) || 1;

  res.status(200).json({
    success: true,
    data: { users },
    meta: {
      page: queryResult.data.page,
      pageSize: queryResult.data.pageSize,
      total,
      totalPages
    },
    message: "Users retrieved successfully"
  });
});

// POST /api/v1/users (Admin only)
usersRouter.post("/", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const parseResult = createUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid user data",
        details: parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          issue: e.message
        }))
      }
    });
    return;
  }

  const result = await UserService.createUser(parseResult.data);
  if (result.error === "DUPLICATE_EMAIL") {
    res.status(409).json({
      success: false,
      error: {
        code: "CONFLICT",
        message: "A user with this email address already exists"
      }
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: { user: result.user },
    message: "User created successfully"
  });
});

// GET /api/v1/users/:id
usersRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const isSelf = req.user?.id === id;
  const isAdmin = req.user?.role === "SUPER_ADMIN" || req.user?.role === "ADMIN";

  if (!isSelf && !isAdmin) {
    res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "You are not authorized to view this user profile" }
    });
    return;
  }

  const user = await UserService.getUserById(id);
  if (!user) {
    res.status(404).json({
      success: false,
      error: { code: "USER_NOT_FOUND", message: `User with id '${id}' was not found` }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { user },
    message: "User retrieved"
  });
});

// PUT /api/v1/users/:id (Admin only)
usersRouter.put("/:id", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = updateUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid update payload" }
    });
    return;
  }

  const updated = await UserService.updateUser(id, parseResult.data);
  if (!updated) {
    res.status(404).json({
      success: false,
      error: { code: "USER_NOT_FOUND", message: `User with id '${id}' was not found` }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { user: updated },
    message: "User updated successfully"
  });
});

// PATCH /api/v1/users/:id/status (SUPER_ADMIN only)
usersRouter.patch("/:id/status", requireRole(["SUPER_ADMIN"]), async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = updateStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid status payload" }
    });
    return;
  }

  const result = await UserService.updateStatus(id, parseResult.data.isActive, req.user!.id);
  if (result.error === "CANNOT_DEACTIVATE_SELF") {
    res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "You cannot deactivate your own active account" }
    });
    return;
  }
  if (result.error === "USER_NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: { code: "USER_NOT_FOUND", message: "User not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { user: result.user },
    message: `User account ${parseResult.data.isActive ? "activated" : "deactivated"} successfully`
  });
});

// POST /api/v1/users/:id/reset-password (Admin only)
usersRouter.post("/:id/reset-password", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body || {};

  const result = await UserService.resetPassword(id, newPassword);
  if (result.error === "USER_NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: { code: "USER_NOT_FOUND", message: "User not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { tempPassword: result.tempPassword },
    message: "Password reset successfully. Active sessions revoked."
  });
});
