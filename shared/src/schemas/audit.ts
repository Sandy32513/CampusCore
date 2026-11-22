import { z } from "zod";

export const queryAuditLogsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  userId: z.string().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  status: z.enum(["SUCCESS", "FAILURE", "WARNING"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  q: z.string().optional()
});

export type QueryAuditLogsInput = z.infer<typeof queryAuditLogsSchema>;
