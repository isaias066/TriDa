import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { alertsService } from "./alerts.service.js";
import { alertIdSchema, listAlertsQuerySchema, updateAlertStatusSchema } from "./alerts.schemas.js";
import { parseId } from "../../utils/params.js";

export class AlertsController {
  async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const options = listAlertsQuerySchema.parse(req.query);

      const result = await alertsService.list(userId, options);

      sendSuccess(res, {
        items: result.alerts,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAlertById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const id_alerta = alertIdSchema.parse(req.params.id);

      const alert = await alertsService.getById(userId, id_alerta);

      sendSuccess(res, alert);
    } catch (error) {
      next(error);
    }
  }

  async getCountsByLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const accountId =
        req.query.id_cuenta === undefined ? undefined : parseId(req.query.id_cuenta);
      const counts = await alertsService.countsByLevel(userId, accountId);

      sendSuccess(res, counts);
    } catch (error) {
      next(error);
    }
  }

  async updateAlertStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const id_alerta = alertIdSchema.parse(req.params.id);

      const data = updateAlertStatusSchema.parse(req.body);
      const updated = await alertsService.updateStatus(userId, id_alerta, data);

      sendSuccess(res, updated, "Estado de alerta actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  // Alias para mantener compatibilidad con las rutas
  list = this.getAlerts.bind(this);
  getById = this.getAlertById.bind(this);
  countsByLevel = this.getCountsByLevel.bind(this);
  updateStatus = this.updateAlertStatus.bind(this);
}

export const alertsController = new AlertsController();
