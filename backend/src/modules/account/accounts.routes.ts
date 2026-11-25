// ¿Qué? Declaración de rutas HTTP para la gestión de cuentas financieras del usuario.
// ¿Para qué? Mapear los endpoints CRUD de cuentas propias protegidas por JWT.
// ¿Impacto? Permite al usuario administrar sus cuentas (bancos, tarjetas, billeteras, efectivo) (RS-001).

import { Router } from "express";
import { accountController } from "./accounts.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas de cuentas requieren autenticación
router.use(requireAuth);

router.get("/", accountController.list);
router.get("/:id", accountController.getById);
router.post("/", accountController.create);
router.patch("/:id", accountController.update);
router.delete("/:id", accountController.deactivate);

export const accountRoutes = router;
export default router;
