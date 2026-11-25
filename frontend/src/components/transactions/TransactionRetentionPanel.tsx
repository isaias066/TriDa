import React, { useState } from "react";
import { Archive, Download, RefreshCw } from "lucide-react";
import { TransactionsApi } from "@/api/Transactions";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/Formatters";
import type { TransactionArchivePreparation } from "@/types/Transaction";

interface TransactionRetentionPanelProps {
  onPurged: () => Promise<void>;
}

export const TransactionRetentionPanel: React.FC<
  TransactionRetentionPanelProps
> = ({ onPurged }) => {
  const { showToast } = useToast();
  const [preparation, setPreparation] =
    useState<TransactionArchivePreparation | null>(null);
  const [hasNoEligibleTransactions, setHasNoEligibleTransactions] =
    useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const prepareArchive = async () => {
    setIsPreparing(true);
    setHasNoEligibleTransactions(false);
    setPreparation(null);
    setIsDownloaded(false);
    try {
      const result = await TransactionsApi.prepareArchive();
      if (!result.id_exportacion || result.total === 0) {
        setHasNoEligibleTransactions(true);
        return;
      }
      setPreparation(result);
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo revisar el historial",
        message:
          error instanceof Error
            ? error.message
            : "No se pudieron preparar los movimientos antiguos.",
      });
    } finally {
      setIsPreparing(false);
    }
  };

  const downloadArchive = async () => {
    if (!preparation?.id_exportacion) return;
    setIsDownloading(true);
    try {
      const file = await TransactionsApi.downloadArchive(
        preparation.id_exportacion,
      );
      const url = window.URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trida_transacciones_antiguas_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
      setIsDownloaded(true);
      showToast({
        type: "success",
        title: "CSV descargado",
        message:
          "Revisa y conserva el archivo antes de confirmar la eliminación.",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo descargar el CSV",
        message:
          error instanceof Error
            ? error.message
            : "Intenta preparar nuevamente la exportación.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const purgeArchive = async () => {
    if (!preparation?.id_exportacion || !isDownloaded) return;
    setIsPurging(true);
    try {
      const result = await TransactionsApi.purgeArchive(
        preparation.id_exportacion,
      );
      setIsConfirmOpen(false);
      setPreparation(null);
      setIsDownloaded(false);
      await onPurged();
      showToast({
        type: result.omitidas > 0 ? "info" : "success",
        title: "Retención anual completada",
        message:
          result.omitidas > 0
            ? `Se eliminaron ${result.eliminadas} movimientos. ${result.omitidas} se conservaron porque ya no cumplían las condiciones. Los saldos no cambiaron.`
            : `Se eliminaron ${result.eliminadas} movimientos antiguos. Los saldos no cambiaron.`,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo completar la eliminación",
        message:
          error instanceof Error
            ? error.message
            : "Prepara y descarga un CSV nuevo antes de volver a intentarlo.",
      });
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <section className="space-y-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
      <div className="flex items-start gap-3">
        <Archive className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary-500)]" />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-[var(--color-text-primary)]">
            Historial anual
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Puedes exportar y eliminar movimientos de un año o más. Los
            movimientos pendientes y las alertas sin resolver se conservan; la
            eliminación no modifica los saldos actuales.
          </p>
        </div>
      </div>

      {!preparation && (
        <div className="space-y-2 pl-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => void prepareArchive()}
            isLoading={isPreparing}
          >
            <RefreshCw className="h-4 w-4" />
            Revisar movimientos antiguos
          </Button>
          {hasNoEligibleTransactions && (
            <p role="status" className="text-sm text-[var(--color-text-muted)]">
              No hay movimientos finalizados de un año o más que puedan
              eliminarse.
            </p>
          )}
        </div>
      )}

      {preparation && (
        <div className="space-y-3 pl-8">
          <p
            role="status"
            className="text-sm text-[var(--color-text-secondary)]"
          >
            Se encontraron{" "}
            <strong>{preparation.total.toLocaleString("es-CO")}</strong>{" "}
            movimientos con fecha hasta{" "}
            <strong>{formatDate(preparation.fecha_corte, "short")}</strong>. La
            exportación vence a los 30 minutos.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void downloadArchive()}
              isLoading={isDownloading}
            >
              <Download className="h-4 w-4" />
              Descargar CSV
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={!isDownloaded}
              onClick={() => setIsConfirmOpen(true)}
            >
              Eliminar movimientos exportados
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isPurging || isDownloading}
              onClick={() => {
                setPreparation(null);
                setIsDownloaded(false);
              }}
            >
              Cancelar
            </Button>
          </div>
          {!isDownloaded && (
            <p className="text-xs text-[var(--color-text-muted)]">
              Primero descarga el archivo CSV; después podrás confirmar la
              eliminación.
            </p>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Eliminar movimientos exportados"
        description={`Se eliminarán definitivamente ${preparation?.total.toLocaleString("es-CO") ?? 0} movimientos del historial y sus alertas asociadas. Confirma solo si descargaste y guardaste el CSV. Los saldos no cambiarán.`}
        confirmText="Confirmar eliminación"
        isLoading={isPurging}
        onConfirm={purgeArchive}
        onClose={() => {
          if (!isPurging) setIsConfirmOpen(false);
        }}
      />
    </section>
  );
};
