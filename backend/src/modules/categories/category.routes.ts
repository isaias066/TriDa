// ¿Qué? Rutas HTTP del módulo de categorías.
// ¿Para qué? Exponer CRUD de categorías personalizadas y listado (sistema + propias).
// ¿Impacto? Todas las rutas exigen JWT (RS-001).

import { Router } from "express";
import { categoryController } from "./category.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", categoryController.list);
router.get("/:id", categoryController.getById);
router.post("/", categoryController.create);
router.patch("/:id", categoryController.update);
router.delete("/:id", categoryController.deactivate);

export const categoryRoutes = router;
export default router;
