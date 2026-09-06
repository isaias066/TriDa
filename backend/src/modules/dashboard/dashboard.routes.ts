// ¿Qué? Rutas del módulo dashboard con soporte para alias en español e inglés.
// ¿Para qué? Mapear estadísticas, alertas recientes y estado en vivo.
// ¿Impacto? Expone métricas solo a usuarios autenticados.

import { Router } from "express";
import { dashboardController } from "./dashboard.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/stats", dashboardController.getStats);

// Soporta sub-rutas en inglés y español
router.get("/recent-alerts", dashboardController.getRecentAlerts);
router.get("/alertas-recientes", dashboardController.getRecentAlerts);

// Estado en vivo (TPS + Latencia + Healthcheck)
router.get("/live-status", dashboardController.getLiveStatus);
router.get("/estado-en-vivo", dashboardController.getLiveStatus);

export default router;
