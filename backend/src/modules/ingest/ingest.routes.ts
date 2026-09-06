import { Router } from "express";
import { ingestTransaction } from "./ingest.controller.js";

const router = Router();

router.post("/transaction", ingestTransaction);

// IMPORTANTE: Debe llevar export default
export default router;
