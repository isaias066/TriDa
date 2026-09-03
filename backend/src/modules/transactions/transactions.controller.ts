// ¿Qué? Controlador HTTP de transacciones.
// ¿Para qué? Devolver el listado paginado y crear transacciones con score de riesgo.
// ¿Impacto? Conecta la página Transacciones con PostgreSQL (Día 4: limit/offset/total).

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
import { transactionsService } from "./transactions.service.js";
import { createTransactionSchema } from "./transactions.schemas.js";

export const transactionsController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const banco =
        typeof req.query.banco === "string" ? req.query.banco : null;
      const limit =
        req.query.limit !== undefined ? Number(req.query.limit) : 500;
      const offset =
        req.query.offset !== undefined ? Number(req.query.offset) : 0;

      res.json(await transactionsService.list(banco, limit, offset));
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createTransactionSchema.parse(req.body);
      res.status(201).json(await transactionsService.create(validatedData));
    } catch (error) {
      next(error);
    }
  },
};
