// ¿Qué? Rutas del módulo dashboard.
// ¿Para qué? Mapear endpoints de estadísticas y alertas recientes.
// ¿Impacto? Expone métricas solo a usuarios autenticados.
// ¿Qué? Rutas del módulo dashboard con soporte para alias en español e inglés.
// ¿Para qué? Mapear estadísticas y alertas recientes sin romper peticiones del frontend.
// ¿Impacto? Evita errores 404 en la carga inicial del panel principal.
import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
const router = Router();
router.use(requireAuth);
router.get('/stats', dashboardController.getStats);
// Soporta sub-rutas en inglés y español
router.get('/recent-alerts', dashboardController.getRecentAlerts);
router.get('/alertas-recientes', dashboardController.getRecentAlerts);
export default router;
//# sourceMappingURL=dashboard.routes.js.map