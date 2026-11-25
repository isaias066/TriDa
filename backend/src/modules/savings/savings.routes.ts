// ¿Qué? Rutas del módulo de metas de ahorro.
// ¿Para qué? Exponer el CRUD de metas y el endpoint de aporte de fondos, protegido por JWT.

import { Router } from "express";
import { savingsController } from "./savings.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", savingsController.list);
router.post("/", savingsController.create);
router.patch("/:id", savingsController.update);
router.post("/:id/funds", savingsController.addFunds);
router.delete("/:id", savingsController.delete);

export default router;
