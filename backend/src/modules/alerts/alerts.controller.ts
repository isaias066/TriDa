// ¿Qué? Controlador HTTP de alertas.
// ¿Para qué? Parsear filtros, paginación, sort y conteos por nivel.

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
import { alertsService } from "./alerts.service.js";
import { updateAlertStatusSchema } from "./alerts.schemas.js";

export const alertsController = {
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

      const level =
        typeof req.query.level === "string" ? req.query.level : undefined;
      const status =
        typeof req.query.status === "string" ? req.query.status : undefined;
      const search =
        typeof req.query.search === "string" ? req.query.search : undefined;

      const sortBy =
        typeof req.query.sortBy === "string" ? req.query.sortBy : "timestamp";
      const sortDirRaw =
        typeof req.query.sortDir === "string"
          ? req.query.sortDir.toLowerCase()
          : "desc";
      const sortDir = sortDirRaw === "asc" ? "asc" : "desc";

      const safeLimit = Number.isFinite(limit) ? limit : 30;
      const safeOffset = Number.isFinite(offset) ? offset : 0;

      res.json(
        await alertsService.list(
          banco,
          safeLimit,
          safeOffset,
          { level, status, search },
          { field: sortBy, direction: sortDir },
        ),
      );
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

      res.json(await alertsService.countsByLevel(banco));
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const idAlerta = Number(req.params.id);
      const validatedData = updateAlertStatusSchema.parse(req.body);
      res.json(
        await alertsService.updateStatus(
          idAlerta,
          req.user!.id_usuario,
          validatedData,
        ),
      );
    } catch (error) {
      next(error);
    }
  },
};
