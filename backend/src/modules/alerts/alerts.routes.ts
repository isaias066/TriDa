// ¿Qué? Rutas del módulo de alertas.
// ¿Para qué? Listado paginado, conteos por nivel y cambio de estado.

import { Router } from "express";
import { alertsController } from "./alerts.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/counts-by-level", alertsController.countsByLevel);
router.get("/", alertsController.list);
router.patch("/:id/status", alertsController.updateStatus);

export default router;
