import { Router, Request, Response } from "express";
import {
  createCourseSchema,
  updateCourseSchema,
  queryCoursesSchema
} from "@campuscore/shared";
import { CourseService } from "../services/courseService.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

export const coursesRouter = Router();

coursesRouter.use(requireAuth);

// GET /api/v1/courses
coursesRouter.get("/", async (req: Request, res: Response) => {
  const queryResult = queryCoursesSchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid query parameters" }
    });
    return;
  }

  const { courses, total } = await CourseService.listCourses(queryResult.data);
  const totalPages = Math.ceil(total / queryResult.data.pageSize) || 1;

  res.status(200).json({
    success: true,
    data: { courses },
    meta: {
      page: queryResult.data.page,
      pageSize: queryResult.data.pageSize,
      total,
      totalPages
    },
    message: "Courses retrieved successfully"
  });
});

// POST /api/v1/courses (Admin only)
coursesRouter.post("/", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const parseResult = createCourseSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid course data",
        details: parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          issue: e.message
        }))
      }
    });
    return;
  }

  const result = await CourseService.createCourse(parseResult.data, {
    user: (req as any).user,
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  if (result.error === "DEPARTMENT_NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: { code: "DEPARTMENT_NOT_FOUND", message: "Referenced department does not exist" }
    });
    return;
  }

  if (result.error === "DUPLICATE_CODE") {
    res.status(409).json({
      success: false,
      error: { code: "DUPLICATE_CODE", message: "Course code already exists" }
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: { course: result.course },
    message: "Course created successfully"
  });
});

// GET /api/v1/courses/:id
coursesRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await CourseService.getCourseById(id);

  if (!course) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Course not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { course },
    message: "Course retrieved successfully"
  });
});

// PUT /api/v1/courses/:id (Admin only)
coursesRouter.put("/:id", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = updateCourseSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid course update data",
        details: parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          issue: e.message
        }))
      }
    });
    return;
  }

  const result = await CourseService.updateCourse(id, parseResult.data, {
    user: (req as any).user,
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  if (result.error === "NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Course not found" }
    });
    return;
  }

  if (result.error === "DEPARTMENT_NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: { code: "DEPARTMENT_NOT_FOUND", message: "Referenced department does not exist" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { course: result.course },
    message: "Course updated successfully"
  });
});

// PATCH /api/v1/courses/:id/status (Admin only)
coursesRouter.patch("/:id/status", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "isActive boolean is required" }
    });
    return;
  }

  const result = await CourseService.toggleCourseStatus(id, isActive, {
    user: (req as any).user,
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  if (result.error === "NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Course not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { course: result.course },
    message: `Course ${isActive ? "activated" : "deactivated"} successfully`
  });
});
