// ¿Qué? Controlador HTTP del dashboard.
// ¿Para qué? Exponer estadísticas financieras del usuario, alertas de riesgo recientes y últimas transacciones.
// ¿Impacto? Conecta el panel principal del frontend con las métricas personales del usuario (RS-001).

import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { dashboardService } from "./dashboard.service.js";
import { dashboardStatsQuerySchema } from "./dashboard.schemas.js";
import { parseId } from "../../utils/params.js";

function getAccountId(req: Request): number | undefined {
  return req.query.id_cuenta === undefined ? undefined : parseId(req.query.id_cuenta);
}

export const dashboardController = {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const { periodo_dias } = dashboardStatsQuerySchema.parse(req.query);
      const data = await dashboardService.getStats(
        userId,
        getAccountId(req),
        periodo_dias,
      );
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getRecentAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;

      let limit = 5;
      if (typeof req.query.limit === "string") {
        const parsed = parseInt(req.query.limit, 10);
        if (!isNaN(parsed)) {
          limit = Math.max(1, Math.min(parsed, 50));
        }
      }

      const data = await dashboardService.getRecentAlerts(userId, limit, getAccountId(req));
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getRecentTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;

      let limit = 5;
      if (typeof req.query.limit === "string") {
        const parsed = parseInt(req.query.limit, 10);
        if (!isNaN(parsed)) {
          limit = Math.max(1, Math.min(parsed, 50));
        }
      }

      const data = await dashboardService.getRecentTransactions(
        userId,
        limit,
        getAccountId(req),
      );
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getRecentAdvice(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const data = await dashboardService.getRecentAdvice(
        userId,
        5,
        getAccountId(req),
      );
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async markAdviceRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const adviceId = parseId(req.params.id);
      const data = await dashboardService.markAdviceRead(userId, adviceId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },
};
