// ¿Qué? Rutas del módulo de alertas.
// ¿Para qué? Exponer GET /api/alerts.
// ¿Impacto? Cierra el stub de alertas con datos reales y autenticación.
import { Router } from 'express';
import { alertsController } from './alerts.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
const router = Router();
router.use(requireAuth);
router.get('/', alertsController.list);
router.patch('/:id/status', alertsController.updateStatus);
export default router;
//# sourceMappingURL=alerts.routes.js.map