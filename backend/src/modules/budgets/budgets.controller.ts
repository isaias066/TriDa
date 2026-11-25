// ¿Qué? Controlador HTTP de presupuestos.
// ¿Para qué? Gestionar la creación, consulta, actualización y eliminación de límites de gasto por categoría.

import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { budgetsService } from "./budgets.service.js";
import {
  budgetQuerySchema,
  createBudgetSchema,
  updateBudgetSchema,
} from "./budgets.schemas.js";
import { parseId } from "../../utils/params.js";

export const budgetsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const filters = budgetQuerySchema.parse(req.query);
      const data = await budgetsService.list(userId, filters);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const validatedData = createBudgetSchema.parse(req.body);
      const created = await budgetsService.create(userId, validatedData);
      sendSuccess(res, created, "Presupuesto creado", 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const budgetId = parseId(req.params.id);

      const validatedData = updateBudgetSchema.parse(req.body);
      const updated = await budgetsService.update(userId, budgetId, validatedData);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const budgetId = parseId(req.params.id);

      const result = await budgetsService.delete(userId, budgetId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
