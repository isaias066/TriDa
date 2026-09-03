// ¿Qué? Controlador HTTP de bancos.
// ¿Para qué? Devolver el catálogo de bancos.
// ¿Impacto? Soporta selectores y filtros multi-banco.
import { banksService } from './banks.service.js';
export const banksController = {
    async list(_req, res, next) {
        try {
            const data = await banksService.list();
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=banks.controller.js.map