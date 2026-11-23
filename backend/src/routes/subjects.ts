import { Router, Request, Response } from "express";
import {
  CreateSubjectSchema,
  UpdateSubjectSchema,
  MapSubjectToCourseSchema,
  QuerySubjectsSchema
} from "@campuscore/shared";
import { SubjectService } from "../services/subjectService.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

export const subjectsRouter = Router();

subjectsRouter.use(requireAuth);

// GET /api/v1/subjects
subjectsRouter.get("/", async (req: Request, res: Response) => {
  const queryResult = QuerySubjectsSchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid subject query parameters" }
    });
    return;
  }

  const { subjects, total } = await SubjectService.listSubjects(queryResult.data);
  const totalPages = Math.ceil(total / queryResult.data.pageSize) || 1;

  res.status(200).json({
    success: true,
    data: { subjects },
    meta: {
      page: queryResult.data.page,
      pageSize: queryResult.data.pageSize,
      total,
      totalPages
    },
    message: "Subjects retrieved successfully"
  });
});

// POST /api/v1/subjects (Admin only)
subjectsRouter.post("/", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const parseResult = CreateSubjectSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid subject input data",
        details: parseResult.error.flatten().fieldErrors
      }
    });
    return;
  }

  const result = await SubjectService.createSubject(parseResult.data, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  if (result.error) {
    if (result.error === "DUPLICATE_CODE") {
      res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_CODE", message: "A subject with this code already exists" }
      });
      return;
    }
    if (result.error === "DEPARTMENT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: { code: "DEPARTMENT_NOT_FOUND", message: "Associated academic department not found" }
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to create subject" }
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: { subject: result.subject },
    message: "Subject created successfully"
  });
});

// GET /api/v1/subjects/:id
subjectsRouter.get("/:id", async (req: Request, res: Response) => {
  const subject = await SubjectService.getSubjectById(req.params.id);
  if (!subject) {
    res.status(404).json({
      success: false,
      error: { code: "SUBJECT_NOT_FOUND", message: "Subject not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { subject },
    message: "Subject details retrieved successfully"
  });
});

// PUT /api/v1/subjects/:id (Admin only)
subjectsRouter.put("/:id", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const parseResult = UpdateSubjectSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid subject update data",
        details: parseResult.error.flatten().fieldErrors
      }
    });
    return;
  }

  const result = await SubjectService.updateSubject(req.params.id, parseResult.data, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  if (result.error) {
    res.status(404).json({
      success: false,
      error: { code: "SUBJECT_NOT_FOUND", message: "Subject not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { subject: result.subject },
    message: "Subject updated successfully"
  });
});

// PATCH /api/v1/subjects/:id/status (Admin only)
subjectsRouter.patch("/:id/status", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const { isActive } = req.body;
  if (typeof isActive !== "boolean") {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "isActive boolean is required" }
    });
    return;
  }

  const result = await SubjectService.toggleSubjectStatus(req.params.id, isActive, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  if (result.error) {
    res.status(404).json({
      success: false,
      error: { code: "SUBJECT_NOT_FOUND", message: "Subject not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { subject: result.subject },
    message: `Subject ${isActive ? "activated" : "deactivated"} successfully`
  });
});

// POST /api/v1/subjects/:id/courses (Admin only)
subjectsRouter.post("/:id/courses", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const parseResult = MapSubjectToCourseSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid course mapping data" }
    });
    return;
  }

  const result = await SubjectService.mapSubjectToCourse(req.params.id, parseResult.data, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  if (result.error) {
    if (result.error === "ALREADY_MAPPED") {
      res.status(409).json({
        success: false,
        error: { code: "ALREADY_MAPPED", message: "Subject is already mapped to this course and semester" }
      });
      return;
    }
    res.status(404).json({
      success: false,
      error: { code: result.error, message: `Entity not found: ${result.error}` }
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: { mapping: result.mapping },
    message: "Subject successfully mapped to course curriculum"
  });
});

// DELETE /api/v1/subjects/:id/courses/:courseId (Admin only)
subjectsRouter.delete("/:id/courses/:courseId", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  await SubjectService.unmapSubjectFromCourse(req.params.id, req.params.courseId, {
    user: req.user!,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  res.status(200).json({
    success: true,
    message: "Subject unmapped from course successfully"
  });
});
