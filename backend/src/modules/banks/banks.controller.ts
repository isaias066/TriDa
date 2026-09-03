// ¿Qué? Controlador HTTP de bancos.
// ¿Para qué? Devolver el catálogo de bancos.
// ¿Impacto? Soporta selectores y filtros multi-banco.

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { banksService } from './banks.service.js';

export const banksController = {
  async list(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await banksService.list();
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};