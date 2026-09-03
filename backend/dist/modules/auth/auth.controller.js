// ¿Qué? Controlador HTTP del módulo de autenticación.
// ¿Para qué? Extraer datos del request, validarlos y delegar la lógica al service.
// ¿Impacto? Capa HTTP delgada; incluye perfil y cambio de contraseña (Día 3).
import { authService, AuthError } from './auth.service.js';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema, changePasswordSchema, } from './auth.schemas.js';
const handleError = (error, next) => {
    if (error instanceof AuthError) {
        return next(Object.assign(error, { statusCode: error.statusCode }));
    }
    return next(error);
};
export const authController = {
    async login(req, res, next) {
        try {
            const data = loginSchema.parse(req.body);
            res.json(await authService.login(data.email, data.password));
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async register(req, res, next) {
        try {
            const data = registerSchema.parse(req.body);
            res.status(201).json(await authService.register(data, req.user.id_usuario));
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async forgotPassword(req, res, next) {
        try {
            const data = forgotPasswordSchema.parse(req.body);
            res.json(await authService.forgotPassword(data.correo));
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async verifyResetToken(req, res, next) {
        try {
            const token = String(req.query.token || '');
            if (!token) {
                res.status(400).json({ valid: false, error: 'Token no proporcionado' });
                return;
            }
            const result = await authService.verifyResetToken(token);
            res.status(result.valid ? 200 : 401).json(result);
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async resetPassword(req, res, next) {
        try {
            const data = resetPasswordSchema.parse(req.body);
            res.json(await authService.resetPassword(data.token, data.nuevaContrasena));
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async me(req, res, next) {
        try {
            res.json(await authService.getMe(req.user.id_usuario));
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async updateProfile(req, res, next) {
        try {
            const data = updateProfileSchema.parse(req.body);
            res.json(await authService.updateProfile(req.user.id_usuario, data));
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async changePassword(req, res, next) {
        try {
            const data = changePasswordSchema.parse(req.body);
            res.json(await authService.changePassword(req.user.id_usuario, data));
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async listUsers(_req, res, next) {
        try {
            res.json(await authService.listSystemUsers());
        }
        catch (error) {
            handleError(error, next);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map