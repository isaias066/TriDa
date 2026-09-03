// ¿Qué? Esquemas de validación Zod para el módulo de transacciones.
// ¿Para qué? Validar que el payload recibido en POST /api/transactions sea correcto antes de consultar el motor de riesgo o la BD.
// ¿Impacto? Evita errores de tipo en PostgreSQL y previene inyecciones o datos malformados.

import { z } from "zod";

export const createTransactionSchema = z.object({
  id_cliente: z.number().int().positive(),
  id_dispositivo: z.number().int().positive(),
  id_ubicacion: z.number().int().positive(),
  id_banco: z.number().int().positive().default(1),
  tipo_transaccion: z.string().min(2),
  monto: z.number().positive(),
  cuenta_origen: z.string().min(5),
  cuenta_destino: z.string().min(5),
  canal: z.enum(["mobile", "web", "pos", "atm", "branch"]).default("web"),
  moneda: z.string().length(3).default("COP"),
});
