// ¿Qué? Rutas del módulo de perfil.
// ¿Para qué? Exponer los endpoints para gestionar la cuenta personal.

import { Router } from "express";
import { profileController } from "./profile.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", profileController.getProfile);
router.patch("/", profileController.updateProfile);
router.get("/behavior-pattern", profileController.getBehaviorPattern);

export default router;
