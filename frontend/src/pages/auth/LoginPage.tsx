/**
 * ¿Qué? Página de inicio de sesión.
 * ¿Para qué? Renderizar el formulario de login y detectar alertas de sesión expirada via query params.
 */
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthLayout } from "../../pages/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { useToast } from "@/components/ui/Toast";

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      showToast({
        type: "warning",
        title: "Sesión expirada",
        message: "Tu sesión ha caducado. Por favor inicia sesión nuevamente.",
      });
    }
    if (searchParams.get("inactive") === "true") {
      showToast({
        type: "warning",
        title: "Cuenta desactivada",
        message: "Tu cuenta está inactiva. Ya cerramos la sesión actual.",
      });
    }
  }, [searchParams, showToast]);

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Ingresa tus credenciales para acceder a tu panel financiero"
    >
      <LoginForm />
    </AuthLayout>
  );
};
