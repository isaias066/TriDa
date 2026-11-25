import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../auth/AuthLayout";
import { TransactionsApi } from "@/api/Transactions";
import type {
  EmailTransactionConfirmation,
  EmailTransactionConfirmationResult,
} from "@/types/Transaction";
import { formatCurrency, formatDate } from "@/utils/Formatters";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, CircleAlert, LoaderCircle, ShieldCheck } from "lucide-react";

export const TransactionConfirmationPage: React.FC = () => {
  const [token] = useState(
    () => {
      const hashQuery = window.location.hash.startsWith("#/")
        ? window.location.hash.slice(window.location.hash.indexOf("?"))
        : "";
      return new URLSearchParams(hashQuery).get("token") ?? "";
    },
  );
  const [confirmation, setConfirmation] =
    useState<EmailTransactionConfirmation | null>(null);
  const [result, setResult] =
    useState<EmailTransactionConfirmationResult | null>(null);
  const [message, setMessage] = useState(
    token ? "Cargando los detalles del movimiento..." : "El enlace no es válido.",
  );
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    let active = true;
    TransactionsApi.getEmailConfirmation(token)
      .then((data) => {
        if (active) {
          setConfirmation(data);
          setMessage("");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los detalles del movimiento.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const respond = async (decision: "FUI_YO" | "NO_FUI_YO") => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await TransactionsApi.resolveEmailConfirmation(
        token,
        decision,
      );
      setResult(response);
      setMessage(
        decision === "FUI_YO"
          ? "El gasto fue confirmado y el saldo de la cuenta fue actualizado."
          : "El gasto fue rechazado y se registró una alerta crítica de seguridad.",
      );
      setConfirmation((current) =>
        current ? { ...current, estado: response.estado, puede_responder: false } : current,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo registrar tu respuesta.";
      setMessage(errorMessage);
      try {
        setConfirmation(await TransactionsApi.getEmailConfirmation(token));
      } catch (refreshError) {
        const refreshMessage =
          refreshError instanceof Error
            ? refreshError.message
            : "No se pudo actualizar el estado del movimiento.";
        setMessage(`${errorMessage} ${refreshMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Confirma el movimiento"
      subtitle="Revisar el enlace no confirma ni rechaza el gasto."
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            {isLoading ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : result?.decision === "FUI_YO" ? (
              <CheckCircle2 className="h-5 w-5 text-income" />
            ) : result?.decision === "NO_FUI_YO" || !token ? (
              <CircleAlert className="h-5 w-5 text-risk-critical" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              {isLoading
                ? "Verificando el movimiento"
                : result?.decision === "FUI_YO"
                  ? "Movimiento confirmado"
                  : result?.decision === "NO_FUI_YO"
                    ? "Movimiento rechazado"
                    : confirmation
                      ? "Revisa los detalles antes de responder"
                      : "No se pudo verificar el enlace"}
            </p>
            <p
              role={result?.decision === "NO_FUI_YO" || !token ? "alert" : "status"}
              className="mt-1 text-xs leading-5 text-text-secondary"
            >
              {message}
            </p>
          </div>
        </div>

        {confirmation && (
          <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
            <div className="col-span-2 rounded-xl bg-surface-hover p-3">
              <dt className="text-xs font-medium text-text-muted">Monto del movimiento</dt>
              <dd className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
                {formatCurrency(confirmation.monto)}
              </dd>
            </div>
            <div className="min-w-0 rounded-xl border border-border p-3">
              <dt className="text-xs text-text-muted">Comercio</dt>
              <dd className="mt-1 truncate font-medium text-text-primary">
                {confirmation.comercio ||
                  confirmation.descripcion ||
                  "Gasto automático"}
              </dd>
            </div>
            <div className="min-w-0 rounded-xl border border-border p-3">
              <dt className="text-xs text-text-muted">Cuenta</dt>
              <dd className="mt-1 truncate font-medium text-text-primary">
                {confirmation.nombre_cuenta ?? "Cuenta vinculada"}
              </dd>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-4 border-t border-border pt-3">
              <dt className="text-xs text-text-muted">Fecha</dt>
              <dd className="text-right text-xs font-medium text-text-secondary">
                {formatDate(confirmation.fecha_transaccion)}
              </dd>
            </div>
          </dl>
        )}

        {confirmation?.puede_responder && !result && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              onClick={() => void respond("FUI_YO")}
              disabled={isLoading}
              className="min-h-11"
            >
              Sí, fui yo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void respond("NO_FUI_YO")}
              disabled={isLoading}
              className="min-h-11"
            >
              No fui yo
            </Button>
          </div>
        )}

        {!isLoading && !confirmation?.puede_responder && (
          <Link
            to="/login"
            className="block rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold text-primary transition-colors hover:bg-surface-hover"
          >
            Ir al inicio de sesión
          </Link>
        )}
      </div>
    </AuthLayout>
  );
};
