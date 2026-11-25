// ¿Qué? Controlador HTTP para el módulo de autenticación.
// ¿Para qué? Validar datos de entrada con Zod y delegar la ejecución a authService.
// ¿Impacto? Capa HTTP limpia y estandarizada con respuestas unificadas.

import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  verifyResetTokenSchema,
  verifyEmailSchema,
} from "./auth.schemas.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { profileService } from "../profile/profile.service.js";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data.email, data.password, req.ip);
      sendSuccess(res, result, "Inicio de sesión exitoso");
    } catch (error) {
      next(error);
    }
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      sendSuccess(res, result, "Registro completado con éxito", 201);
    } catch (error) {
      next(error);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = verifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(token);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(data.email);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async verifyResetToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = verifyResetTokenSchema.parse(req.body);
      const result = await authService.verifyResetToken(token);
      if (!result.valid) {
        throw new AppError(result.error || "Token inválido", 401, "INVALID_RESET_TOKEN");
      }
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(data.token, data.password_nueva);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await profileService.getProfile(req.user!.id_usuario);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const result = await profileService.updateProfile(
        req.user!.id_usuario,
        data,
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = changePasswordSchema.parse(req.body);
      const result = await authService.changePassword(req.user!.id_usuario, data);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.logout(req.user!.id_usuario);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
