import { z } from "zod";
import { MAX_POSTGRES_INT } from "../../utils/params.js";

export const listAlertsQuerySchema = z.object({
  id_cuenta: z.coerce.number().int().positive().max(MAX_POSTGRES_INT).optional(),
  estado: z.enum(["PENDIENTE", "CONFIRMADA", "DESCARTADA"]).optional(),
  severidad: z.enum(["BAJA", "MEDIA", "ALTA", "CRITICA"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sort_by: z.enum(["fecha_detectada", "severidad", "estado"]).default("fecha_detectada"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

export const alertIdSchema = z.coerce.number().int().positive().max(MAX_POSTGRES_INT);

export const updateAlertStatusSchema = z
  .object({
    estado: z.enum(["CONFIRMADA", "DESCARTADA"]),
    accion_usuario: z.enum(["FUI_YO", "NO_FUI_YO", "BLOQUEAR_TARJETA"]),
  })
  .strict()
  .refine(
    (data) =>
      (data.accion_usuario !== "FUI_YO" || data.estado === "DESCARTADA") &&
      (data.accion_usuario !== "NO_FUI_YO" || data.estado === "CONFIRMADA") &&
      (data.accion_usuario !== "BLOQUEAR_TARJETA" || data.estado === "CONFIRMADA"),
    {
      message: "La acción del usuario debe coincidir con el estado de la alerta",
      path: ["accion_usuario"],
    },
  );

export type ListAlertsQueryInput = z.infer<typeof listAlertsQuerySchema>;
export type UpdateAlertStatusInput = z.infer<typeof updateAlertStatusSchema>;
