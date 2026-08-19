import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';

const router = Router();

router.get('/metricas', analyticsController.getMetricas);
router.get('/agregaciones', analyticsController.getAgregaciones);

export default router;
