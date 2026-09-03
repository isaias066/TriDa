// ¿Qué? Controlador HTTP de alertas.
// ¿Para qué? Exponer listado de alertas (con total) y actualización de estado.
// ¿Impacto? Permite revisar/filtrar alertas por banco sin truncar en silencio.
import { alertsService } from './alerts.service.js';
import { updateAlertStatusSchema } from './alerts.schemas.js';
export const alertsController = {
    async list(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const limit = req.query.limit !== undefined ? Number(req.query.limit) : 500;
            const offset = req.query.offset !== undefined ? Number(req.query.offset) : 0;
            res.json(await alertsService.list(banco, limit, offset));
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const idAlerta = Number(req.params.id);
            const validatedData = updateAlertStatusSchema.parse(req.body);
            res.json(await alertsService.updateStatus(idAlerta, req.user.id_usuario, validatedData));
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=alerts.controller.js.map