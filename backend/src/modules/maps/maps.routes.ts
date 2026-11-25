// ¿Qué? Rutas del módulo del mapa geográfico con alias en español e inglés.
// ¿Para qué? Servir estadísticas y puntos del mapa a la vista interactiva.
// ¿Impacto? Resuelve endpoints de estadísticas y ubicaciones con autenticación JWT y datos reales.

import { Router } from "express";
import { mapController } from "./maps.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/stats", mapController.getStats);

// Soporta sub-rutas en inglés y español
router.get("/locations", mapController.getLocations);
router.get("/ubicaciones", mapController.getLocations);

export default router;
