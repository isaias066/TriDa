/**
 * ¿Qué? Página de registro de nuevo usuario.
 */
import React from "react";
import { AuthLayout } from "../../pages/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Crear una cuenta"
      subtitle="Comienza a monitorear y proteger tus finanzas de forma inteligente"
    >
      <RegisterForm />
    </AuthLayout>
  );
};
