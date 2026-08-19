import { Router } from 'express';
import * as entidadesController from '../controllers/entidadesController';

const router = Router();

router.get('/tareas', entidadesController.getClientes);
router.get('/transacciones', entidadesController.getTransacciones);
router.get('/alertas', entidadesController.getAlertas);
router.get('/dispositivos', entidadesController.getDispositivos);
router.get('/usuarios', entidadesController.getUsuarios);
router.get('/bancos', entidadesController.getBancos);

export default router;

