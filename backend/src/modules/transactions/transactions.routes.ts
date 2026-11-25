// ¿Qué? Definición de rutas Express para el módulo de transacciones.
// ¿Para qué? Exponer endpoints protegidos por autenticación JWT y rate limiting.

import { Router } from "express";
import { transactionsController } from "./transactions.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/email-confirmation", transactionsController.getEmailConfirmationDetails);
router.post("/email-confirmation", transactionsController.confirmEmail);

router.use(requireAuth);

router.get("/", transactionsController.list);
router.get("/counts-by-level", transactionsController.countsByLevel);
router.post("/archive/prepare", transactionsController.prepareArchive);
router.post("/archive/:exportId/download", transactionsController.downloadArchive);
router.post("/archive/:exportId/purge", transactionsController.purgeArchive);
router.get("/:id", transactionsController.getById);
router.post("/", transactionsController.create);
router.patch("/:id/status", transactionsController.changeStatus);
router.patch("/:id/category", transactionsController.changeCategory);
router.delete("/:id", transactionsController.delete);

export default router;
