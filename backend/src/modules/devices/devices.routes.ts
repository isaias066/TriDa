// ¿Qué? Rutas del módulo de dispositivos.
// ¿Para qué? Exponer endpoints de consulta, registro, actualización de confianza y eliminación de dispositivos.
// ¿Impacto? Conecta los endpoints de dispositivos con seguridad JWT y limitación de tasa.

import { Router } from "express";
import { devicesController } from "./devices.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", devicesController.list);
router.get("/:id", devicesController.getById);
router.post("/", devicesController.register);
router.patch("/:id/trust", devicesController.updateTrustStatus);
router.delete("/:id", devicesController.delete);

export default router;
