/**
 * ¿Qué? Página para solicitar el restablecimiento de contraseña via email.
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthApi } from "@/api/Auth";
import { useToast } from "@/components/ui/Toast";

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      showToast({
        type: "error",
        title: "Correo inválido",
        message: "Por favor ingresa un correo electrónico válido.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await AuthApi.forgotPassword({ email: email.trim().toLowerCase() });
      setIsSent(true);
      showToast({
        type: "success",
        title: "Correo enviado",
        message: "Revisa tu bandeja de entrada para continuar.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al procesar la solicitud.";
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
      title="Recuperar contraseña"
      subtitle="Solicita un enlace de recuperación por correo cuando el servicio esté disponible."
    >
      {isSent ? (
        <div className="space-y-4 text-center py-2">
          <div className="p-4 rounded-xl bg-income/10 border border-income/20 text-income text-xs font-medium">
            Se ha enviado un mensaje a{" "}
            <span className="font-bold">{email}</span> con las instrucciones de
            recuperación.
          </div>
          <p className="text-xs text-text-muted">
            Si no lo encuentras en unos minutos, revisa tu carpeta de correo no
            deseado (SPAM).
          </p>
          <Link to="/login" className="block pt-2">
            <Button variant="outline" className="w-full">
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Correo electrónico registrado"
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-text-muted" />}
            required
            autoComplete="email"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            Enviar correo de recuperación
          </Button>

          <div className="pt-4 text-center border-t border-border">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
