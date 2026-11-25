// ¿Qué? Controlador HTTP para el perfil de usuario.
// ¿Para qué? Exponer las rutas de lectura, actualización y consulta de patrón financiero.

import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { profileService } from "./profile.service.js";
import { updateProfileSchema } from "../auth/auth.schemas.js";

export const profileController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const profile = await profileService.getProfile(userId);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const validatedData = updateProfileSchema.parse(req.body);
      const updated = await profileService.updateProfile(userId, validatedData);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async getBehaviorPattern(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id_usuario;
      const pattern = await profileService.getBehaviorPattern(userId);
      sendSuccess(res, pattern);
    } catch (error) {
      next(error);
    }
  },
};
