import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FraudAlert, AlertUserAction } from "@/types/Alert";
import { ShieldCheck, AlertOctagon, Lock } from "lucide-react";
import { formatDate, formatCurrency } from "@/utils/Formatters";

interface AlertActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: FraudAlert | null;
  onResolve: (id: number, accion: AlertUserAction) => Promise<boolean>;
}

export const AlertActionModal: React.FC<AlertActionModalProps> = ({
  isOpen,
  onClose,
  alert,
  onResolve,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!alert) return null;

  const handleAction = async (accion: AlertUserAction) => {
    setIsSubmitting(true);
    const success = await onResolve(alert.id_alerta, accion);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revisión de Seguridad"
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        <div className="p-4 bg-[var(--color-bg-surface-hover)] border border-[var(--color-border-subtle)] rounded-xl space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
            Motivo de Detección
          </div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {alert.motivo}
          </p>

          {alert.transaccion && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[var(--color-text-subtle)] block">
                  Comercio
                </span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {alert.transaccion.comercio || "No especificado"}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-subtle)] block">
                  Monto
                </span>
                <span className="font-semibold text-[var(--color-text-primary)] font-mono">
                  {formatCurrency(alert.transaccion.monto)}
                </span>
              </div>
            </div>
          )}

          <div className="text-xs text-[var(--color-text-muted)] font-mono pt-1">
            Detectada: {formatDate(alert.fecha_detectada)}
          </div>
        </div>

        <div className="pt-2">
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-3 text-center">
            ¿Reconoces este movimiento financiero?
          </p>

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => handleAction("FUI_YO")}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full border-income/30 text-income hover:bg-income/10"
            >
              <ShieldCheck className="w-4 h-4" />
              Sí, reconozco esta actividad (Fui yo)
            </Button>

            <Button
              variant="outline"
              onClick={() => handleAction("NO_FUI_YO")}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full border-risk-critical/30 text-risk-critical hover:bg-risk-critical/10"
            >
              <AlertOctagon className="w-4 h-4" />
              No fui yo (Confirmar Fraude)
            </Button>

            <Button
              type="button"
              onClick={() => handleAction("BLOQUEAR_TARJETA")}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full bg-risk-critical hover:bg-risk-critical/90 text-white border-transparent"
            >
              <Lock className="w-4 h-4" />
              Solicitar bloqueo de tarjeta
            </Button>
          </div>
          <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
            La solicitud quedará registrada; el sistema no bloquea la tarjeta
            automáticamente.
          </p>
        </div>
      </div>
    </Modal>
  );
};
