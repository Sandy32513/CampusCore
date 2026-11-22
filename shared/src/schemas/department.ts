import { z } from "zod";

export const createDepartmentSchema = z.object({
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(50, "Code cannot exceed 50 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only letters, numbers, hyphens, and underscores")
    .transform((val) => val.toUpperCase()),
  name: z.string().min(2, "Name must be at least 2 characters").max(150),
  description: z.string().max(1000).optional().nullable(),
  headOfDepartment: z.string().max(150).optional().nullable()
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  description: z.string().max(1000).optional().nullable(),
  headOfDepartment: z.string().max(150).optional().nullable(),
  isActive: z.boolean().optional()
});

export const queryDepartmentsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  q: z.string().optional(),
  status: z.enum(["active", "inactive", "all"]).default("all")
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type QueryDepartmentsInput = z.infer<typeof queryDepartmentsSchema>;
