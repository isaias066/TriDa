// ¿Qué? Controlador HTTP de dispositivos.
// ¿Para qué? Devolver el inventario de dispositivos.
// ¿Impacto? Conecta la vista de dispositivos con la BD.
import { devicesService } from './devices.service.js';
export const devicesController = {
    async list(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await devicesService.list(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=devices.controller.js.map