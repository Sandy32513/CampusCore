import { Router, Request, Response } from "express";
import {
  CreateStudentSchema,
  UpdateStudentSchema,
  QueryStudentsSchema
} from "@campuscore/shared";
import { StudentService } from "../services/studentService.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

export const studentsRouter = Router();

studentsRouter.use(requireAuth);

// GET /api/v1/students
studentsRouter.get("/", async (req: Request, res: Response) => {
  const queryResult = QueryStudentsSchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid student query parameters" }
    });
    return;
  }

  const { students, total } = await StudentService.listStudents(queryResult.data);
  const totalPages = Math.ceil(total / queryResult.data.pageSize) || 1;

  res.status(200).json({
    success: true,
    data: { students },
    meta: {
      page: queryResult.data.page,
      pageSize: queryResult.data.pageSize,
      total,
      totalPages
    },
    message: "Students retrieved successfully"
  });
});

// POST /api/v1/students (Admin only)
studentsRouter.post("/", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const parseResult = CreateStudentSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid student input data",
        details: parseResult.error.flatten().fieldErrors
      }
    });
    return;
  }

  const result = await StudentService.createStudent(parseResult.data, {
    user: (req as any).user,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  if (result.error) {
    if (result.error === "DUPLICATE_EMAIL") {
      res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_EMAIL", message: "A student with this email address already exists" }
      });
      return;
    }
    if (result.error === "DUPLICATE_ADMISSION_NUMBER") {
      res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_ADMISSION_NUMBER", message: "A student with this admission number already exists" }
      });
      return;
    }
    if (result.error.endsWith("_NOT_FOUND")) {
      res.status(404).json({
        success: false,
        error: { code: result.error, message: `Referenced entity not found: ${result.error}` }
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to create student" }
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: { student: result.student },
    message: "Student admitted and registered successfully"
  });
});

// GET /api/v1/students/:id
studentsRouter.get("/:id", async (req: Request, res: Response) => {
  const student = await StudentService.getStudentById(req.params.id);
  if (!student) {
    res.status(404).json({
      success: false,
      error: { code: "STUDENT_NOT_FOUND", message: "Student record not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { student },
    message: "Student record retrieved successfully"
  });
});

// PUT /api/v1/students/:id (Admin only)
studentsRouter.put("/:id", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const parseResult = UpdateStudentSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid student update data",
        details: parseResult.error.flatten().fieldErrors
      }
    });
    return;
  }

  const result = await StudentService.updateStudent(req.params.id, parseResult.data, {
    user: (req as any).user,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  if (result.error) {
    if (result.error === "NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: { code: "STUDENT_NOT_FOUND", message: "Student record not found" }
      });
      return;
    }
    if (result.error === "DUPLICATE_EMAIL") {
      res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_EMAIL", message: "Email is already taken by another student" }
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to update student" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { student: result.student },
    message: "Student record updated successfully"
  });
});

// PATCH /api/v1/students/:id/status (Admin only)
studentsRouter.patch("/:id/status", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status || !["ACTIVE", "INACTIVE", "SUSPENDED", "GRADUATED", "DROPPED"].includes(status)) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Valid student status is required" }
    });
    return;
  }

  const result = await StudentService.toggleStudentStatus(req.params.id, status, {
    user: (req as any).user,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  if (result.error) {
    res.status(404).json({
      success: false,
      error: { code: "STUDENT_NOT_FOUND", message: "Student record not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { student: result.student },
    message: `Student status updated to ${status}`
  });
});

// DELETE /api/v1/students/:id (Super Admin only)
studentsRouter.delete("/:id", requireRole(["SUPER_ADMIN"]), async (req: Request, res: Response) => {
  const result = await StudentService.deleteStudent(req.params.id, {
    user: (req as any).user,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  if (!result.success) {
    res.status(404).json({
      success: false,
      error: { code: "STUDENT_NOT_FOUND", message: "Student record not found" }
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Student record deleted successfully"
  });
});
