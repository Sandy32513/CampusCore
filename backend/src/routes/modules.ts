import { Router, Request, Response } from "express";
import { ApiErrorResponse, ApiResponse, MODULE_CATALOG, ModuleDescriptor } from "@campuscore/shared";

export const modulesRouter = Router();

modulesRouter.get("/", (_req: Request, res: Response<ApiResponse<{ modules: ModuleDescriptor[] }>>) => {
  res.status(200).json({
    success: true,
    data: {
      modules: MODULE_CATALOG
    },
    message: "CampusCore module registry retrieved successfully"
  });
});

modulesRouter.get("/:slug", (req: Request, res: Response<ApiResponse<ModuleDescriptor | null> | ApiErrorResponse>) => {
  const { slug } = req.params;
  const mod = MODULE_CATALOG.find((m) => m.slug === slug || m.id === slug);

  if (!mod) {
    res.status(404).json({
      success: false,
      error: {
        code: "MODULE_NOT_FOUND",
        message: `Module with slug '${slug}' was not found in the registry`
      }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: mod,
    message: `Module '${mod.name}' retrieved`
  });
});
