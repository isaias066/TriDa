// ¿Qué? Controlador HTTP de transacciones.
// ¿Para qué? Devolver el listado paginado y crear transacciones con score de riesgo.
// ¿Impacto? Conecta la página Transacciones con PostgreSQL (Día 4: limit/offset/total).
import { transactionsService } from "./transactions.service.js";
import { createTransactionSchema } from "./transactions.schemas.js";
export const transactionsController = {
    async list(req, res, next) {
        try {
            const banco = typeof req.query.banco === "string" ? req.query.banco : null;
            const limit = req.query.limit !== undefined ? Number(req.query.limit) : 500;
            const offset = req.query.offset !== undefined ? Number(req.query.offset) : 0;
            // ✅ Llamada con 3 argumentos alineada al servicio paginado
            const result = await transactionsService.list(banco, limit, offset);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const validatedData = createTransactionSchema.parse(req.body);
            res.status(201).json(await transactionsService.create(validatedData));
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=transactions.controller.js.map