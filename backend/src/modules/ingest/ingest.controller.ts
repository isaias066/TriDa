import { Request, Response, NextFunction } from "express";
import { IngestService } from "./ingest.service.js";
import { TransactionIngestSchema } from "./ingest.schemas.js";

const ingestService = new IngestService();

export async function ingestTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Validar Payload mediante Zod
    const parsedData = TransactionIngestSchema.parse(req.body);

    // Procesar la transacción
    const result = await ingestService.processTransaction(parsedData);

    res.status(201).json({
      success: true,
      message: "Transacción procesada correctamente por TriDa",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
