// ¿Qué? Controlador HTTP del dashboard.
// ¿Para qué? Exponer estadísticas y alertas recientes al frontend.
// ¿Impacto? Permite al dashboard consumir métricas sin lógica de negocio en la capa HTTP.
import { dashboardService } from './dashboard.service.js';
export const dashboardController = {
    async getStats(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await dashboardService.getStats(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
    async getRecentAlerts(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await dashboardService.getRecentAlerts(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=dashboard.controller.js.map