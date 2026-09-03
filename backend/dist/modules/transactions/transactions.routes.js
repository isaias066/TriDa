// ¿Qué? Rutas del módulo de transacciones.
// ¿Para qué? Exponer GET /api/transactions.
// ¿Impacto? Sustituye el endpoint stub por datos reales.
import { Router } from 'express';
import { transactionsController } from './transactions.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
const router = Router();
router.use(requireAuth);
router.get('/', transactionsController.list);
router.post('/', transactionsController.create);
export default router;
//# sourceMappingURL=transactions.routes.js.map