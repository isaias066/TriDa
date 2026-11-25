// ¿Qué? Esquemas Zod para filtros opcionales de insights.
// ¿Para qué? Validar el periodo de análisis solicitado por el frontend.

import { z } from "zod";
import { MAX_POSTGRES_INT } from "../../utils/params.js";

export const insightsQuerySchema = z.object({
  periodo_dias: z.coerce.number().int().min(7).max(365).default(30),
  id_cuenta: z.coerce.number().int().positive().max(MAX_POSTGRES_INT).optional(),
});

export type InsightsQueryInput = z.infer<typeof insightsQuerySchema>;
