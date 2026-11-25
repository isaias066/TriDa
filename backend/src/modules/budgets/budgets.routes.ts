// ¿Qué? Rutas del módulo de presupuestos.
// ¿Para qué? Exponer el CRUD de límites de gasto protegido por autenticación JWT.

import { Router } from "express";
import { budgetsController } from "./budgets.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", budgetsController.list);
router.post("/", budgetsController.create);
router.patch("/:id", budgetsController.update);
router.delete("/:id", budgetsController.delete);

export default router;
