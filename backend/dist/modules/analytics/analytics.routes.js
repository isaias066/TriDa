// ¿Qué? Rutas del módulo de analítica.
// ¿Para qué? Exponer métricas y agregaciones.
// ¿Impacto? Sustituye stubs de analytics por consultas reales.
// ¿Qué? Rutas del módulo analítico con alias en español.
// ¿Para qué? Exponer métricas globales y agregaciones por canal/ciudad/banco.
// ¿Impacto? Resuelve los errores 404 de /api/analytics/metricas y /agregaciones.
import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
const router = Router();
router.use(requireAuth);
// Soporta sub-rutas en inglés y español
router.get('/metrics', analyticsController.getMetrics);
router.get('/metricas', analyticsController.getMetrics);
router.get('/aggregations', analyticsController.getAggregations);
router.get('/agregaciones', analyticsController.getAggregations);
export default router;
//# sourceMappingURL=analytics.routes.js.map