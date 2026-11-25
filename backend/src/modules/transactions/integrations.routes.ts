import { Router } from "express";
import { transactionsController } from "./transactions.controller.js";
import { requireTransactionWebhookSecret } from "./transaction-webhook-auth.middleware.js";

const router = Router();

router.post(
  "/transactions/webhook",
  requireTransactionWebhookSecret,
  transactionsController.ingestExternal,
);

export default router;
