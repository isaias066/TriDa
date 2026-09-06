// ¿Qué? Controlador HTTP de transacciones.
// ¿Para qué? Capturar filtros, límite, offset y reglas de ordenamiento.

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
import { transactionsService } from "./transactions.service.js";
import { createTransactionSchema } from "./transactions.schemas.js";

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export const transactionsController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const banco =
        typeof req.query.banco === "string" && req.query.banco.trim() !== ""
          ? req.query.banco.trim()
          : null;

      const limit =
        req.query.limit !== undefined ? Number(req.query.limit) : 30;
      const offset =
        req.query.offset !== undefined ? Number(req.query.offset) : 0;

      const status =
        typeof req.query.status === "string" ? req.query.status : undefined;
      const level =
        typeof req.query.level === "string" ? req.query.level : undefined;
      const channel =
        typeof req.query.channel === "string" ? req.query.channel : undefined;
      const search =
        typeof req.query.search === "string" ? req.query.search : undefined;

      const amountMin = parseOptionalNumber(req.query.amountMin);
      const amountMax = parseOptionalNumber(req.query.amountMax);

      const sortBy =
        typeof req.query.sortBy === "string" ? req.query.sortBy : "timestamp";
      const sortDirRaw =
        typeof req.query.sortDir === "string"
          ? req.query.sortDir.toLowerCase()
          : "desc";
      const sortDir = sortDirRaw === "asc" ? "asc" : "desc";

      const safeLimit = Number.isFinite(limit) ? limit : 30;
      const safeOffset = Number.isFinite(offset) ? offset : 0;

      const result = await transactionsService.list(
        banco,
        safeLimit,
        safeOffset,
        {
          status,
          level,
          channel,
          search,
          amountMin,
          amountMax,
        },
        { field: sortBy, direction: sortDir },
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async countsByLevel(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const banco =
        typeof req.query.banco === "string" && req.query.banco.trim() !== ""
          ? req.query.banco.trim()
          : null;

      const counts = await transactionsService.countsByLevel(banco);
      res.json(counts);
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createTransactionSchema.parse(req.body);
      const created = await transactionsService.create(validatedData);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  },
};
