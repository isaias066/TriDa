// ¿Qué? Controlador HTTP de metas de ahorro.
// ¿Para qué? Gestionar la creación, consulta, aporte de fondos y eliminación de metas financieras.

import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { savingsService } from "./savings.service.js";
import {
  addFundsSchema,
  createSavingsSchema,
  savingsIdSchema,
  updateSavingsSchema,
} from "./savings.schemas.js";

export const savingsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const data = await savingsService.list(userId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const validatedData = createSavingsSchema.parse(req.body);
      const created = await savingsService.create(userId, validatedData);
      sendSuccess(res, created, "Meta de ahorro creada", 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const metaId = savingsIdSchema.parse(req.params.id);

      const validatedData = updateSavingsSchema.parse(req.body);
      const updated = await savingsService.update(userId, metaId, validatedData);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async addFunds(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const metaId = savingsIdSchema.parse(req.params.id);

      const validatedData = addFundsSchema.parse(req.body);
      const updated = await savingsService.addFunds(userId, metaId, validatedData);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const metaId = savingsIdSchema.parse(req.params.id);

      const result = await savingsService.delete(userId, metaId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
