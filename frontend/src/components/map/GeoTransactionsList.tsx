import { Store, MapPin, AlertOctagon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/utils/Formatters";
import { getRiskBadgeClass, getRiskLabel } from "@/utils/Risk";
import type { GeoTransaction } from "@/types";

interface GeoTransactionsListProps {
  transactions: GeoTransaction[];
  selectedTransaction: GeoTransaction | null;
  onSelectTransaction: (tx: GeoTransaction) => void;
}

export function GeoTransactionsList({
  transactions,
  selectedTransaction,
  onSelectTransaction,
}: GeoTransactionsListProps) {
  return (
    <Card className="p-4 border-[var(--color-border)] bg-[var(--color-bg-card)] flex flex-col h-[560px]">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-3">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-[var(--color-primary)]" />
          <h2 className="text-xs font-bold text-[var(--color-text-primary)]">
            Comercios Registrados ({transactions.length})
          </h2>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[var(--color-text-muted)]">
          <MapPin className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-xs font-medium">
            No hay transacciones geolocalizadas con estos filtros
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {transactions.map((tx) => {
            const isSelected =
              selectedTransaction?.id_transaccion === tx.id_transaccion;

            return (
              <button
                key={tx.id_transaccion}
                type="button"
                onClick={() => onSelectTransaction(tx)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-[var(--color-bg-secondary)] border-[var(--color-primary)] shadow-sm"
                    : "bg-[var(--color-bg-card)] border-[var(--color-border)] hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                      {tx.comercio || "Comercio no especificado"}
                    </p>
                    <p className="text-2xs text-[var(--color-text-muted)] mt-0.5 truncate">
                      {tx.ciudad
                        ? `${tx.ciudad}, ${tx.pais || ""}`
                        : `${tx.latitud}, ${tx.longitud}`}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[var(--color-text-primary)]">
                      {formatCurrency(tx.monto)}
                    </p>
                    <p className="text-2xs text-[var(--color-text-muted)] mt-0.5">
                      {formatDate(tx.fecha_transaccion)}
                    </p>
                  </div>
                </div>

                {/* Badges de riesgo / categoría */}
                <div className="flex items-center gap-1.5 mt-2">
                  {tx.categoria && (
                    <span
                      className="text-2xs px-2 py-0.5 rounded-md font-medium text-white"
                      style={{
                        backgroundColor:
                          tx.categoria.color || "var(--color-primary)",
                      }}
                    >
                      {tx.categoria.nombre}
                    </span>
                  )}
                  {tx.nivel_riesgo && (
                    <span
                      className={`text-2xs px-1.5 py-0.5 rounded-md font-semibold ${getRiskBadgeClass(
                        tx.nivel_riesgo,
                      )}`}
                    >
                      {getRiskLabel(tx.nivel_riesgo)}
                    </span>
                  )}
                  {tx.es_sospechosa && (
                    <span className="text-2xs px-1.5 py-0.5 rounded-md bg-[var(--color-danger-light)] text-[var(--color-danger)] font-bold flex items-center gap-0.5">
                      <AlertOctagon className="w-2.5 h-2.5" />
                      Anomalía
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
