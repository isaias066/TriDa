import React, { useEffect, useState } from "react";
import { Clock3, ShieldCheck } from "lucide-react";
import { AuditApi } from "@/api/Audit";
import type { AuditEvent } from "@/types/Audit";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const actionLabels: Record<string, string> = {
  INICIO_SESION_EXITOSO: "Inicio de sesión",
  INICIO_SESION_FALLIDO: "Intento de inicio de sesión rechazado",
  CAMBIO_EMAIL: "Correo electrónico actualizado",
  CAMBIO_PASSWORD: "Contraseña actualizada",
  CAMBIO_ESTADO: "Estado de la cuenta actualizado",
  DISPOSITIVO_REGISTRADO: "Dispositivo registrado",
  DISPOSITIVO_MARCADO_CONFIABLE: "Dispositivo marcado como confiable",
  DISPOSITIVO_MARCADO_NO_CONFIABLE: "Dispositivo marcado como no confiable",
  DISPOSITIVO_ELIMINADO: "Dispositivo eliminado",
  ALERTA_FRAUDE_RESUELTA: "Alerta de fraude revisada",
  TRANSACCION_RESUELTA: "Transacción pendiente resuelta",
};

const formatAction = (event: AuditEvent) =>
  actionLabels[event.tipo_accion] ??
  event.tipo_accion.replaceAll("_", " ").toLocaleLowerCase("es-CO");

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const SecurityHistory: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [requestCursor, setRequestCursor] = useState<number | undefined>();
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    AuditApi.getMyHistory({
      limit: 20,
      before_id: requestCursor,
    })
      .then((response) => {
        if (!active) return;
        setEvents((current) =>
          requestCursor === undefined
            ? response.items
            : [...current, ...response.items],
        );
        setNextCursor(response.next_cursor);
        setHasMore(response.has_more);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "No se pudo cargar el historial de seguridad.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [requestCursor, retryCount]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          <CardTitle>Historial de seguridad</CardTitle>
        </div>
        <CardDescription>
          Consulta los accesos y cambios de seguridad de tu cuenta. Este
          historial es de solo lectura y no muestra direcciones IP.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="space-y-3" role="alert">
            <p className="text-sm text-expense">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRetryCount((current) => current + 1)}
            >
              Reintentar
            </Button>
          </div>
        )}

        {!error && isLoading && (
          <p className="text-sm text-text-muted" role="status">
            Cargando historial...
          </p>
        )}

        {!error && !isLoading && events.length === 0 && (
          <p className="text-sm text-text-muted">
            Todavía no hay eventos de seguridad registrados.
          </p>
        )}

        {events.length > 0 && (
          <ol
            className="divide-y divide-border"
            aria-label="Eventos de seguridad"
          >
            {events.map((event) => (
              <li
                key={event.id_log}
                className="flex gap-3 py-4 first:pt-0 last:pb-0"
              >
                <Clock3
                  className="mt-0.5 h-4 w-4 shrink-0 text-text-muted"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {formatAction(event)}
                  </p>
                  {event.descripcion && (
                    <p className="mt-1 text-sm text-text-muted">
                      {event.descripcion}
                    </p>
                  )}
                  <time
                    className="mt-1 block text-xs text-text-subtle"
                    dateTime={event.fecha_accion}
                  >
                    {formatDate(event.fecha_accion)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}

        {!error && hasMore && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading || nextCursor === null}
              onClick={() => {
                if (nextCursor !== null) setRequestCursor(nextCursor);
              }}
            >
              {isLoading ? "Cargando..." : "Ver eventos anteriores"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
