// ¿Qué? Rutas del módulo de autenticación.
// ¿Para qué? Mapear login, registro, perfil, cambio de contraseña y usuarios sistema.
// ¿Impacto? Expone endpoints EN/ES con middlewares de auth y roles.
import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { loginRateLimiter } from '../../middlewares/rateLimit.middleware.js';
const router = Router();
// Públicas
router.post('/login', loginRateLimiter, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.get('/verify-reset-token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);
// Sesión actual
router.get('/me', requireAuth, authController.me);
router.patch('/me', requireAuth, authController.updateProfile);
router.patch('/perfil', requireAuth, authController.updateProfile);
router.post('/change-password', requireAuth, authController.changePassword);
router.post('/cambiar-contrasena', requireAuth, authController.changePassword);
// Admin
router.post('/register', requireAuth, requireRoles(['ADMINISTRADOR']), authController.register);
router.get('/users', requireAuth, requireRoles(['ADMINISTRADOR']), authController.listUsers);
router.get('/usuarios-sistema', requireAuth, requireRoles(['ADMINISTRADOR']), authController.listUsers);
export default router;
//# sourceMappingURL=auth.routes.js.map