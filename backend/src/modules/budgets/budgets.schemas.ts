import { z } from "zod";
import { positiveMoney } from "../../utils/money.js";
import { MAX_POSTGRES_INT } from "../../utils/params.js";

export const createBudgetSchema = z
  .object({
    id_categoria: z.coerce.number().int().positive("El ID de la categoría es requerido").max(MAX_POSTGRES_INT),
    limite_mensual: positiveMoney,
    mes: z.coerce.number().int().min(1).max(12),
    anio: z.coerce.number().int().min(2020).max(2100),
  })
  .strict();

export const updateBudgetSchema = z
  .object({
    limite_mensual: positiveMoney,
  })
  .strict();

export const budgetQuerySchema = z.object({
  id_cuenta: z.coerce.number().int().positive().max(MAX_POSTGRES_INT).optional(),
  mes: z.coerce.number().int().min(1).max(12).optional(),
  anio: z.coerce.number().int().min(2020).max(2100).optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type BudgetQueryInput = z.infer<typeof budgetQuerySchema>;
