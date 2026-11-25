import { Router } from "express";
import { insightsController } from "./insights.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", insightsController.getInsights);
router.post("/scan-message", insightsController.scanMessage);

export default router;
