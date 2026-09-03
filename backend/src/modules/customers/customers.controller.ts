// ¿Qué? Controlador HTTP de clientes.
// ¿Para qué? Exponer listados de clientes al frontend.
// ¿Impacto? Página de clientes / usuarios del negocio con datos reales.

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { customersService } from './customers.service.js';

export const customersController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
      const data = await customersService.list(banco);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};