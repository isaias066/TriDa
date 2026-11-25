// ¿Qué? Rutas del módulo dashboard con soporte para alias en español e inglés.
// ¿Para qué? Mapear estadísticas financieras, alertas de riesgo y transacciones recientes.
// ¿Impacto? Expone métricas de resumen financiero únicamente a usuarios autenticados.

import { Router } from "express";
import { dashboardController } from "./dashboard.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

// Estadísticas principales (Saldos y resumen del mes)
router.get("/stats", dashboardController.getStats);
router.get("/estadisticas", dashboardController.getStats);

// Alertas recientes de riesgo / fraude
router.get("/recent-alerts", dashboardController.getRecentAlerts);
router.get("/alertas-recientes", dashboardController.getRecentAlerts);

// Transacciones recientes
router.get("/recent-transactions", dashboardController.getRecentTransactions);
router.get("/transacciones-recientes", dashboardController.getRecentTransactions);
router.get("/advice", dashboardController.getRecentAdvice);
router.patch("/advice/:id/read", dashboardController.markAdviceRead);

export default router;
