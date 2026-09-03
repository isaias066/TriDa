// ¿Qué? Controlador HTTP de dispositivos.
// ¿Para qué? Devolver el inventario de dispositivos.
// ¿Impacto? Conecta la vista de dispositivos con la BD.

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { devicesService } from './devices.service.js';

export const devicesController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
      const data = await devicesService.list(banco);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};