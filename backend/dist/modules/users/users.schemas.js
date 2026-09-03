import { z } from 'zod';
export const updateUserStatusSchema = z.object({
    estado: z.boolean(),
});
export const updateUserRoleSchema = z.object({
    rol: z.enum(['ADMINISTRADOR', 'ANALISTA', 'OPERADOR', 'AUDITOR']),
});
//# sourceMappingURL=users.schemas.js.map