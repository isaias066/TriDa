// ¿Qué? Controlador HTTP de dispositivos.
// ¿Para qué? Devolver el inventario de dispositivos del usuario autenticado y gestionar su estado de confianza.
// ¿Impacto? Conecta la vista de dispositivos con la BD personal.

import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { devicesService } from "./devices.service.js";
import { registerDeviceSchema, updateTrustSchema } from "./devices.schemas.js";
import { parseId } from "../../utils/params.js";

export const devicesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const data = await devicesService.list(userId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const deviceId = parseId(req.params.id);

      const device = await devicesService.getById(userId, deviceId);

      sendSuccess(res, device);
    } catch (error) {
      next(error);
    }
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const validatedData = registerDeviceSchema.parse(req.body);
      const result = await devicesService.registerOrUpdate(userId, validatedData);
      sendSuccess(res, result, "Dispositivo registrado", 201);
    } catch (error) {
      next(error);
    }
  },

  async updateTrustStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const deviceId = parseId(req.params.id);

      const { confiable } = updateTrustSchema.parse(req.body);
      const updated = await devicesService.updateTrustStatus(userId, deviceId, confiable);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const deviceId = parseId(req.params.id);

      const result = await devicesService.delete(userId, deviceId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
