import { z } from "zod";

export const dashboardStatsQuerySchema = z.object({
  periodo_dias: z.coerce
    .number()
    .int()
    .refine((value) => [30, 90, 180, 365].includes(value), {
      message: "El periodo debe ser de 30, 90, 180 o 365 días",
    })
    .default(30),
});
