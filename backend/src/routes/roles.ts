import { Router, Request, Response } from "express";
import { RoleService } from "../services/roleService.js";
import { requireAuth } from "../middleware/auth.js";

export const rolesRouter = Router();

rolesRouter.use(requireAuth);

rolesRouter.get("/", (_req: Request, res: Response) => {
  const roles = RoleService.listRoles();
  res.status(200).json({
    success: true,
    data: { roles },
    message: "Roles and permissions retrieved"
  });
});

export const permissionsRouter = Router();

permissionsRouter.use(requireAuth);

permissionsRouter.get("/", (_req: Request, res: Response) => {
  const permissions = RoleService.listPermissions();
  res.status(200).json({
    success: true,
    data: { permissions },
    message: "System permissions retrieved"
  });
});
