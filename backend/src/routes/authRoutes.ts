import { Router } from 'express';
import * as authController from '../controllers/authController';
import { verifyToken, requireAdmin } from '../middlewares/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/register', verifyToken, requireAdmin, authController.register);
router.get('/verify-reset-token', authController.verifyResetToken);
router.get('/usuarios-sistema', verifyToken, requireAdmin, authController.listarUsuariosSistema);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;

