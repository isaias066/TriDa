// ¿Qué? Controlador HTTP del mapa.
// ¿Para qué? Exponer stats y ubicaciones geolocalizadas.
// ¿Impacto? Conecta la página Mapa con PostgreSQL.
import { mapService } from './map.service.js';
export const mapController = {
    async getStats(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await mapService.getStats(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
    async getLocations(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await mapService.getLocations(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=map.controller.js.map