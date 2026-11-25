import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { AuthApi } from "@/api/Auth";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  MailCheck,
} from "lucide-react";

export const VerifyEmailPage: React.FC = () => {
  const [token] = useState(
    () =>
      new URLSearchParams(window.location.hash.slice(1)).get("token") ||
      new URLSearchParams(window.location.search).get("token") ||
      "",
  );
  const [status, setStatus] = useState<"verifying" | "verified" | "error">(
    token ? "verifying" : "error",
  );
  const [message, setMessage] = useState(
    token
      ? "Verificando el enlace..."
      : "No se encontró el enlace de verificación.",
  );

  useEffect(() => {
    if (!token) return;

    let active = true;
    AuthApi.verifyEmail({ token })
      .then(() => {
        if (active) {
          setStatus("verified");
          setMessage("Tu correo ha sido verificado. Ya puedes iniciar sesión.");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setStatus("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "El enlace de verificación es inválido o expiró.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthLayout
      title="Verificación de correo"
      subtitle="Confirma el correo asociado a tu cuenta de TriDa"
      centerHeader
    >
      <div className="space-y-5 text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
            status === "verified"
              ? "bg-income/10 text-income"
              : status === "error"
                ? "bg-expense/10 text-expense"
                : "bg-primary/10 text-primary"
          }`}
        >
          {status === "verified" ? (
            <CheckCircle2 className="h-8 w-8" />
          ) : status === "error" ? (
            <AlertCircle className="h-8 w-8" />
          ) : (
            <LoaderCircle className="h-8 w-8 animate-spin" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            {status === "verified"
              ? "Correo confirmado"
              : status === "error"
                ? "No se pudo confirmar"
                : "Estamos verificando tu correo"}
          </h2>
          <p
            role="status"
            className="mt-2 text-center text-sm leading-6 text-text-secondary"
          >
            {message}
          </p>
        </div>
        {status === "verified" && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-income/20 bg-income/5 p-3 text-center text-xs text-text-secondary">
            <MailCheck className="h-4 w-4 text-income" />
            Tu cuenta ya está lista para iniciar sesión.
          </div>
        )}
        <Link
          to="/login"
          aria-disabled={status === "verifying"}
          onClick={(event) => {
            if (status === "verifying") event.preventDefault();
          }}
          className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors ${
            status === "verifying"
              ? "pointer-events-none bg-surface-hover text-text-muted"
              : "bg-primary text-primary-contrast hover:bg-primary-hover"
          }`}
        >
          Ir al inicio de sesión
        </Link>
      </div>
    </AuthLayout>
  );
};
