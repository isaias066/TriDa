// ¿Qué? Controlador HTTP de reportes financieros.
// ¿Para qué? Exponer resumen, desglose por categoría y detalle exportable del usuario autenticado.

import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { reportsService } from "./reports.service.js";
import { reportQuerySchema } from "./reports.schemas.js";

export const reportsController = {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const query = reportQuerySchema.parse(req.query);
      const data = await reportsService.getSummary(userId, query);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const query = reportQuerySchema.parse(req.query);
      const data = await reportsService.getByCategory(userId, query);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getTransactionsReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const query = reportQuerySchema.parse(req.query);
      const data = await reportsService.getTransactionsReport(userId, query);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },
};
