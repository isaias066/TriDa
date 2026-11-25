// ¿Qué? Controlador HTTP del mapa.
// ¿Para qué? Exponer estadísticas y ubicaciones geolocalizadas del usuario autenticado.
// ¿Impacto? Conecta la vista Mapa con PostgreSQL usando límites dinámicos (RS-001).

import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { mapService } from "./maps.service.js";
import { mapQuerySchema } from "./maps.schemas.js";

export const mapController = {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const filters = mapQuerySchema.parse(req.query);
      const data = await mapService.getStats(userId, filters.id_cuenta);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;

      const filters = mapQuerySchema.parse(req.query);
      const data = await mapService.getLocations(userId, filters);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },
};
