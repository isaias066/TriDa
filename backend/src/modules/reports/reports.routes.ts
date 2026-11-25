// ¿Qué? Rutas del módulo de reportes.
// ¿Para qué? Exponer endpoints de resumen, categorías y detalle de transacciones protegidos por JWT.

import { Router } from "express";
import { reportsController } from "./reports.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/summary", reportsController.getSummary);
router.get("/by-category", reportsController.getByCategory);
router.get("/transactions", reportsController.getTransactionsReport);

export default router;
