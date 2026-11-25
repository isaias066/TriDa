// ¿Qué? Esquemas Zod del módulo de categorías de gasto/ingreso/ahorro.
// ¿Para qué? Validar creación y edición de categorías personalizadas del usuario.
// ¿Impacto? Evita tipos inválidos y nombres vacíos; las default del sistema no se editan por aquí.

import { z } from "zod";

export const categoryTypeEnum = z.enum(["INGRESO", "GASTO", "AHORRO"], {
  message: "Tipo inválido. Use: INGRESO, GASTO o AHORRO",
});

export const createCategorySchema = z
  .object({
    nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(80),
    tipo: categoryTypeEnum,
    color: z
      .string()
      .trim()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Color hex inválido (ej. #8B5CF6)")
      .optional()
      .default("#8B5CF6"),
  })
  .strict();

export const updateCategorySchema = z
  .object({
    nombre: z.string().trim().min(2).max(80).optional(),
    tipo: categoryTypeEnum.optional(),
    color: z
      .string()
      .trim()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Color hex inválido")
      .optional(),
    estado: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });
