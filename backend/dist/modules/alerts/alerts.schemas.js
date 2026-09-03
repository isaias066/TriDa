import { z } from 'zod';
export const updateAlertStatusSchema = z.object({
    estado_alerta: z.enum(['ACTIVA', 'EN_REVISION', 'RESUELTA', 'DESCARTADA']),
    clasificacion: z.enum(['FRAUDE_CONFIRMADO', 'FALSO_POSITIVO', 'PENDIENTE_INVESTIGACION', 'REQUIERE_CONTACTO_CLIENTE']).optional(),
    comentarios: z.string().optional(),
});
//# sourceMappingURL=alerts.schemas.js.map