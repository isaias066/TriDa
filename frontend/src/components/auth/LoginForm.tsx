/**
 * ¿Qué? Formulario de autenticación de usuario.
 * ¿Para qué? Capturar credenciales y llamar al contexto de inicio de sesión.
 */
import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const getRedirectPath = (): string => {
    const from = (location.state as { from?: unknown } | null)?.from;
    let path: string | null = null;

    if (typeof from === "string") {
      path = from;
    } else if (typeof from === "object" && from !== null) {
      const route = from as {
        pathname?: unknown;
        search?: unknown;
        hash?: unknown;
      };
      if (typeof route.pathname === "string") {
        path =
          route.pathname +
          (typeof route.search === "string" ? route.search : "") +
          (typeof route.hash === "string" ? route.hash : "");
      }
    }

    return path?.startsWith("/") &&
      !path.startsWith("//") &&
      !path.startsWith("/\\")
      ? path
      : "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError("Por favor completa todos los campos.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email, password });
      showToast({
        type: "success",
        title: "¡Bienvenido a TriDa!",
        message: "Has iniciado sesión correctamente.",
      });
      navigate(getRedirectPath(), { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Credenciales inválidas.";
      setFormError(message);
      showToast({
        type: "error",
        title: "Error de autenticación",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="rounded-lg bg-expense/10 border border-expense/20 p-3 text-xs text-expense font-medium">
          {formError}
        </div>
      )}

      <Input
        label="Correo electrónico"
        type="email"
        placeholder="ejemplo@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail className="w-4 h-4 text-text-muted" />}
        required
        autoComplete="email"
      />

      <div className="space-y-1">
        <Input
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          autoComplete="current-password"
        />

        <div className="flex justify-end pt-1">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        isLoading={isSubmitting}
      >
        Iniciar sesión
      </Button>

      <div className="pt-4 text-center border-t border-border">
        <p className="text-xs text-text-secondary">
          ¿Aún no tienes una cuenta?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </form>
  );
};
