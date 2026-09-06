// ¿Qué? Controlador HTTP del mapa.
// ¿Para qué? Exponer stats y ubicaciones geolocalizadas con paginación real.
// ¿Impacto? Conecta la página Mapa con PostgreSQL usando límites dinámicos.

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
import { mapService } from "./map.service.js";

export const mapController = {
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const banco =
        typeof req.query.banco === "string" ? req.query.banco : null;
      const data = await mapService.getStats(banco);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getLocations(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const banco =
        typeof req.query.banco === "string" ? req.query.banco : null;

      // Parsear límite dinámico de forma segura
      let limit = 500;
      if (typeof req.query.limit === "string") {
        const parsed = parseInt(req.query.limit, 10);
        if (!isNaN(parsed)) {
          limit = Math.max(1, Math.min(parsed, 2000)); // Cap entre 1 y 2000
        }
      }

      const data = await mapService.getLocations(banco, limit);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};
