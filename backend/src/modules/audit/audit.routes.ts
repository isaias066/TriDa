import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { auditController } from "./audit.controller.js";

const router = Router();

router.get("/", requireAuth, auditController.getOwnHistory);

export default router;
