// ¿Qué? Controlador HTTP de clientes.
// ¿Para qué? Exponer listados de clientes al frontend.
// ¿Impacto? Página de clientes / usuarios del negocio con datos reales.
import { customersService } from './customers.service.js';
export const customersController = {
    async list(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await customersService.list(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=customers.controller.js.map