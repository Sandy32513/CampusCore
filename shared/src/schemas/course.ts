import { z } from "zod";

export const DEGREE_LEVELS = ["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA", "CERTIFICATE"] as const;

export const createCourseSchema = z.object({
  departmentId: z.string().min(1, "Department ID is required"),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(50, "Code cannot exceed 50 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only alphanumeric characters, dashes, and underscores")
    .transform((val) => val.toUpperCase()),
  name: z.string().min(2, "Name must be at least 2 characters").max(150),
  description: z.string().max(1000).optional().nullable(),
  degreeLevel: z.enum(DEGREE_LEVELS).default("UNDERGRADUATE"),
  durationYears: z.coerce.number().min(0.5, "Duration must be at least 0.5 years").max(10, "Duration cannot exceed 10 years").default(4.0),
  totalCredits: z.coerce.number().int().min(1, "Total credits must be at least 1").max(500).default(120)
});

export const updateCourseSchema = z.object({
  departmentId: z.string().min(1).optional(),
  name: z.string().min(2).max(150).optional(),
  description: z.string().max(1000).optional().nullable(),
  degreeLevel: z.enum(DEGREE_LEVELS).optional(),
  durationYears: z.coerce.number().min(0.5).max(10).optional(),
  totalCredits: z.coerce.number().int().min(1).max(500).optional(),
  isActive: z.boolean().optional()
});

export const queryCoursesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  departmentId: z.string().optional(),
  degreeLevel: z.enum(DEGREE_LEVELS).optional(),
  status: z.enum(["active", "inactive", "all"]).default("all"),
  q: z.string().optional()
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type QueryCoursesInput = z.infer<typeof queryCoursesSchema>;
