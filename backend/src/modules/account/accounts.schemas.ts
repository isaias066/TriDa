import { z } from "zod";
import { nonNegativeMoney } from "../../utils/money.js";

const accountTypeSchema = z.enum(["BANCO", "TARJETA", "BILLETERA", "EFECTIVO"]);
const accountColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "El color debe estar en formato hexadecimal");
const maskedAccountNumberSchema = z
  .string()
  .trim()
  .regex(/^(?:\*{4})?\d{4}$/, "Solo se permiten los últimos cuatro dígitos")
  .transform((value) => value.slice(-4));

export const createAccountSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es requerido").max(100),
    entidad: z.string().trim().max(100).optional(),
    tipo: accountTypeSchema,
    numero_enmascarado: maskedAccountNumberSchema.optional(),
    color: accountColorSchema.optional().default("#8B5CF6"),
    saldo_inicial: nonNegativeMoney.optional().default(0),
    estado: z.boolean().optional().default(true),
  })
  .strict()
  .superRefine((account, context) => {
    if (account.tipo === "EFECTIVO") return;
    if (!account.entidad) {
      context.addIssue({
        code: "custom",
        path: ["entidad"],
        message: "La entidad financiera es requerida",
      });
    }
    if (!account.numero_enmascarado) {
      context.addIssue({
        code: "custom",
        path: ["numero_enmascarado"],
        message: "El número de cuenta es requerido",
      });
    }
  });

export const updateAccountSchema = z
  .object({
    nombre: z.string().trim().min(1).max(100).optional(),
    entidad: z.string().trim().max(100).optional(),
    tipo: accountTypeSchema.optional(),
    numero_enmascarado: maskedAccountNumberSchema.optional(),
    color: accountColorSchema.optional(),
    estado: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar",
  });

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
