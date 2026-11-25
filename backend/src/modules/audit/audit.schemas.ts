import { z } from "zod";
import { MAX_POSTGRES_INT } from "../../utils/params.js";

export const auditHistoryQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    before_id: z.coerce.number().int().positive().max(MAX_POSTGRES_INT).optional(),
  })
  .strict();

export type AuditHistoryQuery = z.infer<typeof auditHistoryQuerySchema>;
