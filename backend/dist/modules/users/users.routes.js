import { Router } from 'express';
import { usersController } from './users.controller.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
const router = Router();
router.use(requireAuth);
router.use(requireRoles(['ADMINISTRADOR']));
router.get('/', usersController.listAll);
router.patch('/:id/status', usersController.updateStatus);
router.patch('/:id/role', usersController.updateRole);
export default router;
//# sourceMappingURL=users.routes.js.map