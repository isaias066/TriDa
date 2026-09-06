// ¿Qué? Controlador HTTP del dashboard.
// ¿Para qué? Exponer estadísticas, alertas recientes y estado en vivo al frontend.
// ¿Impacto? Permite al dashboard consumir métricas reales y estado de conexión.

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const banco =
        typeof req.query.banco === "string" ? req.query.banco : null;
      const data = await dashboardService.getStats(banco);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getRecentAlerts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const banco =
        typeof req.query.banco === "string" ? req.query.banco : null;

      let limit = 15;
      if (typeof req.query.limit === "string") {
        const parsed = parseInt(req.query.limit, 10);
        if (!isNaN(parsed)) {
          limit = Math.max(1, Math.min(parsed, 100));
        }
      }

      const data = await dashboardService.getRecentAlerts(banco, limit);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getLiveStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const banco =
        typeof req.query.banco === "string" ? req.query.banco : null;
      const data = await dashboardService.getLiveStatus(banco);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};
