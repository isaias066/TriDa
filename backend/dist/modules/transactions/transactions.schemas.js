import { z } from 'zod';
export const createTransactionSchema = z.object({
    id_cliente: z.number().int().positive(),
    id_dispositivo: z.number().int().positive(),
    id_ubicacion: z.number().int().positive(),
    id_banco: z.number().int().positive().default(1),
    tipo_transaccion: z.string().min(2),
    monto: z.number().positive(),
    cuenta_origen: z.string().min(5),
    cuenta_destino: z.string().min(5),
    canal: z.enum(['mobile', 'web', 'pos', 'atm', 'branch']).default('web'),
    moneda: z.string().length(3).default('COP'),
});
//# sourceMappingURL=transactions.schemas.js.map