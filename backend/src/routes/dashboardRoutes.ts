import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';

const router = Router();

router.get('/stats', dashboardController.getStats);
router.get('/alertas-recientes', dashboardController.getAlertasRecientes);

export default router;

