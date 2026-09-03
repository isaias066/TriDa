// ¿Qué? Rutas del módulo de dispositivos.
// ¿Para qué? Exponer GET /api/devices.
// ¿Impacto? Cierra el stub de dispositivos.

import { Router } from 'express';
import { devicesController } from './devices.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', devicesController.list);

export default router;