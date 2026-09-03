// ¿Qué? Rutas del módulo de mapa.
// ¿Para qué? Exponer estadísticas y ubicaciones.
// ¿Impacto? Cierra los endpoints de mapa con autenticación y datos reales.
// ¿Qué? Rutas del módulo del mapa geográfico con alias en español.
// ¿Para qué? Servir estadísticas y puntos del mapa a la vista interactiva.
// ¿Impacto? Resuelve el error 404 de /api/mapa/ubicaciones.
import { Router } from 'express';
import { mapController } from './map.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
const router = Router();
router.use(requireAuth);
router.get('/stats', mapController.getStats);
// Soporta sub-rutas en inglés y español
router.get('/locations', mapController.getLocations);
router.get('/ubicaciones', mapController.getLocations);
export default router;
//# sourceMappingURL=map.routes.js.map