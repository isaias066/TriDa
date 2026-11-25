import { z } from "zod";

export const registerDeviceSchema = z
  .object({
    identificador_unico: z.string().trim().min(1).max(255),
    tipo_dispositivo: z.string().trim().min(1).max(50),
    sistema_operativo: z.string().trim().max(100).optional(),
    navegador: z.string().trim().max(100).optional(),
  })
  .strict();

export const updateTrustSchema = z
  .object({
    confiable: z.boolean(),
  })
  .strict();

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
export type UpdateTrustInput = z.infer<typeof updateTrustSchema>;
