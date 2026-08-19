import { Router } from 'express';
import * as mapaController from '../controllers/mapaController';

const router = Router();

router.get('/stats', mapaController.getStats);
router.get('/ubicaciones', mapaController.getUbicaciones);

export default router;

