// ¿Qué? Rutas del módulo de transacciones.
// ¿Para qué? Exponer listado paginado, conteos por nivel y alta de TX.
// ¿Impacto? Paginación real + badges de criticidad independientes del filtro de tabla.

import { Router } from "express";
import { transactionsController } from "./transactions.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/counts-by-level", transactionsController.countsByLevel);
router.get("/", transactionsController.list);
router.post("/", transactionsController.create);

export default router;
