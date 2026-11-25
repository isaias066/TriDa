// ¿Qué? Esquemas Zod para filtros de reportes financieros.
// ¿Para qué? Validar rangos de fechas y tipo de reporte solicitado.

import { z } from "zod";
import { MAX_POSTGRES_INT } from "../../utils/params.js";

export const reportQuerySchema = z
  .object({
    id_cuenta: z.coerce.number().int().positive().max(MAX_POSTGRES_INT).optional(),
    fecha_inicio: z.iso.datetime().or(z.iso.date()).optional(),
    fecha_fin: z.iso.datetime().or(z.iso.date()).optional(),
    tipo_movimiento: z
      .enum(["INGRESO", "GASTO", "AHORRO", "TRANSFERENCIA"])
      .optional(),
    limit: z.coerce.number().int().min(1).max(5000).default(500),
  })
  .superRefine((data, ctx) => {
    if (data.fecha_inicio && data.fecha_fin) {
      const start = new Date(data.fecha_inicio);
      const end = new Date(data.fecha_fin);
      if (start.getTime() > end.getTime()) {
        ctx.addIssue({
          code: "custom",
          path: ["fecha_fin"],
          message: "La fecha de fin debe ser igual o posterior a la fecha de inicio",
        });
      }
    }
  });

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
