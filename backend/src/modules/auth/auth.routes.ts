// ¿Qué? Rutas del módulo de autenticación (Auth).
// ¿Para qué? Mapear los endpoints de login, registro público, perfil y restablecimiento de contraseña.
// ¿Impacto? Expone la API de autenticación en inglés (RL-001) protegida con rate limiters y JWT.

import { Router } from "express";
import { authController } from "./auth.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  authMutationRateLimiter,
  forgotPasswordRateLimiter,
  loginRateLimiter,
  loginIpRateLimiter,
  registerRateLimiter,
  verifyResetTokenRateLimiter,
} from "../../middlewares/rateLimit.middleware.js";

const router = Router();

// ── Rutas Públicas ───────────────────────────────────────────
router.post("/login", loginIpRateLimiter, loginRateLimiter, authController.login);
router.post("/register", registerRateLimiter, authController.register);
router.post("/verify-email", authMutationRateLimiter, authController.verifyEmail);
router.post("/forgot-password", forgotPasswordRateLimiter, authController.forgotPassword);
router.post("/verify-reset-token", verifyResetTokenRateLimiter, authController.verifyResetToken);
router.post("/reset-password", authMutationRateLimiter, authController.resetPassword);

// ── Rutas Protegidas (Requieren Token JWT) ───────────────────
router.get("/me", requireAuth, authController.me);
router.patch("/me", requireAuth, authController.updateProfile);
router.post("/change-password", requireAuth, authMutationRateLimiter, authController.changePassword);
router.post("/logout", requireAuth, authController.logout);

export const authRoutes = router;
export default router;
