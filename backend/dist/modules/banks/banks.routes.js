// ¿Qué? Rutas del catálogo de bancos.
// ¿Para qué? Permitir la consulta pública del listado de bancos para los filtros del sistema.
// ¿Impacto? Permite que el selector de bancos de la interfaz cargue siempre sin bloquearse por autenticación.
import { Router } from 'express';
import { banksController } from './banks.controller.js';
const router = Router();
// El catálogo de bancos es de libre acceso para llenar los selectores
router.get('/', banksController.list);
export default router;
//# sourceMappingURL=banks.routes.js.map