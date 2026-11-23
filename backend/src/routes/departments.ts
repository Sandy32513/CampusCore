import { Router, Request, Response } from "express";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  queryDepartmentsSchema
} from "@campuscore/shared";
import { DepartmentService } from "../services/departmentService.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

export const departmentsRouter = Router();

departmentsRouter.use(requireAuth);

// GET /api/v1/departments
departmentsRouter.get("/", async (req: Request, res: Response) => {
  const queryResult = queryDepartmentsSchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid query parameters" }
    });
    return;
  }

  const { departments, total } = await DepartmentService.listDepartments(queryResult.data);
  const totalPages = Math.ceil(total / queryResult.data.pageSize) || 1;

  res.status(200).json({
    success: true,
    data: { departments },
    meta: {
      page: queryResult.data.page,
      pageSize: queryResult.data.pageSize,
      total,
      totalPages
    },
    message: "Departments retrieved successfully"
  });
});

// POST /api/v1/departments (Admin only)
departmentsRouter.post("/", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const parseResult = createDepartmentSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid department data",
        details: parseResult.error.issues.map((e) => ({
          field: e.path.join("."),
          issue: e.message
        }))
      }
    });
    return;
  }

  const result = await DepartmentService.createDepartment(parseResult.data, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  if (result.error === "DUPLICATE_CODE") {
    res.status(409).json({
      success: false,
      error: { code: "DUPLICATE_CODE", message: "Department code already exists" }
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: { department: result.department },
    message: "Department created successfully"
  });
});

// GET /api/v1/departments/:id
departmentsRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const department = await DepartmentService.getDepartmentById(id);

  if (!department) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Department not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { department },
    message: "Department retrieved successfully"
  });
});

// PUT /api/v1/departments/:id (Admin only)
departmentsRouter.put("/:id", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = updateDepartmentSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid department update data",
        details: parseResult.error.issues.map((e) => ({
          field: e.path.join("."),
          issue: e.message
        }))
      }
    });
    return;
  }

  const result = await DepartmentService.updateDepartment(id, parseResult.data, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  if (result.error === "NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Department not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { department: result.department },
    message: "Department updated successfully"
  });
});

// PATCH /api/v1/departments/:id/status (Admin only)
departmentsRouter.patch("/:id/status", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "isActive boolean is required" }
    });
    return;
  }

  const result = await DepartmentService.toggleDepartmentStatus(id, isActive, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  if (result.error === "NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Department not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { department: result.department },
    message: `Department ${isActive ? "activated" : "deactivated"} successfully`
  });
});
