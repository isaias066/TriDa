// ¿Qué? Controlador HTTP de analítica.
// ¿Para qué? Devolver métricas y agregaciones al frontend.
// ¿Impacto? Conecta la vista de Analítica con las funciones SQL de agregación.
import { analyticsService } from './analytics.service.js';
export const analyticsController = {
    async getMetrics(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await analyticsService.getMetrics(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
    async getAggregations(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await analyticsService.getAggregations(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=analytics.controller.js.map