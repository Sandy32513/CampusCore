import { z } from "zod";
import { SYSTEM_ROLES } from "../constants/roles.js";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(SYSTEM_ROLES).default("STUDENT")
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(SYSTEM_ROLES).optional()
});

export const updateStatusSchema = z.object({
  isActive: z.boolean()
});

export const queryUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  role: z.enum(SYSTEM_ROLES).optional(),
  q: z.string().optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type QueryUsersInput = z.infer<typeof queryUsersSchema>;
