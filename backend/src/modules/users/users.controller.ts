// ¿Qué? Controlador HTTP de usuarios del sistema.
// ¿Para qué? Gestionar la consulta, cambio de estado (activo/inactivo) y asignación de roles.
// ¿Impacto? Conecta la gestión administrativa de usuarios con el servicio y PostgreSQL, cumpliendo con ESM y RBAC.

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
import { usersService } from "./users.service.js";
import {
  updateUserStatusSchema,
  updateUserRoleSchema,
} from "./users.schemas.js";

export const usersController = {
  async listAll(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.json(await usersService.listAll());
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
      const { estado } = updateUserStatusSchema.parse(req.body);
      res.json(await usersService.updateStatus(Number(req.params.id), estado));
    } catch (error) {
      next(error);
    }
  },

  async updateRole(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { rol } = updateUserRoleSchema.parse(req.body);
      res.json(await usersService.updateRole(Number(req.params.id), rol));
    } catch (error) {
      next(error);
    }
  },
};
