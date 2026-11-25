/**
 * ¿Qué? Página para ingresar la nueva contraseña recibida por token.
 */
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { AuthApi } from "@/api/Auth";
import { useToast } from "@/components/ui/Toast";
import { getPasswordValidationMessage } from "@/utils/Password";

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [token] = useState(
    () =>
      new URLSearchParams(window.location.hash.slice(1)).get("token") ||
      new URLSearchParams(window.location.search).get("token") ||
      "",
  );
  const [isVerifying, setIsVerifying] = useState(Boolean(token));
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    window.history.replaceState(null, "", window.location.pathname);
    let active = true;
    AuthApi.verifyResetToken({ token })
      .then((valid) => {
        if (active) {
          setIsTokenValid(valid);
          if (!valid) setTokenError("El enlace es inválido o ha expirado.");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setTokenError(
            error instanceof Error
              ? error.message
              : "No se pudo verificar el enlace de recuperación.",
          );
        }
      })
      .finally(() => {
        if (active) setIsVerifying(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showToast({
        type: "error",
        title: "Token no encontrado",
        message: "El enlace de recuperación es inválido o ha expirado.",
      });
      return;
    }

    const passwordError = getPasswordValidationMessage(passwordNueva);
    if (passwordError) {
      showToast({
        type: "error",
        title: "Contraseña inválida",
        message: passwordError,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await AuthApi.resetPassword({
        token,
        password_nueva: passwordNueva,
      });

      showToast({
        type: "success",
        title: "Contraseña actualizada",
        message: "Tu contraseña ha sido restablecida con éxito. Inicia sesión.",
      });
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al restablecer contraseña.";
      showToast({
        type: "error",
        title: "Error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Crea una contraseña segura para proteger tu cuenta"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {(!token || (!isVerifying && !isTokenValid)) && (
          <div className="p-3 rounded-lg bg-expense/10 border border-expense/20 text-expense text-xs font-medium">
            {token
              ? tokenError || "El enlace es inválido o ha expirado."
              : "No se detectó un token de seguridad. Solicita un nuevo enlace."}
          </div>
        )}

        {isVerifying && (
          <p className="text-xs text-text-muted">
            Verificando el enlace de recuperación...
          </p>
        )}

        <div>
          <Input
            label="Nueva contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-text-muted" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-muted hover:text-text-primary focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
            required
          />

          <PasswordStrengthMeter password={passwordNueva} />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isSubmitting}
          disabled={!token || !isTokenValid || isVerifying}
        >
          Guardar nueva contraseña
        </Button>

        <div className="pt-4 text-center border-t border-border">
          <Link
            to="/login"
            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
