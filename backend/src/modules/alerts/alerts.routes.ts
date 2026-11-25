// ¿Qué? Rutas del módulo de alertas.
// ¿Para qué? Exponer listado paginado, conteos por nivel, detalle individual y actualización de estado de alertas.

import { Router } from "express";
import { alertsController } from "./alerts.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/counts-by-level", alertsController.countsByLevel);
router.get("/", alertsController.list);
router.get("/:id", alertsController.getById);
router.patch("/:id/status", alertsController.updateStatus);

export default router;
