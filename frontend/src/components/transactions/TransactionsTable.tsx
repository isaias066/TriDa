import React from "react";
import { Transaction } from "@/types/Transaction";
import { Category } from "@/types/Category";
import { RiskBadge } from "./RiskBadge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatCurrency, formatDate } from "@/utils/Formatters";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  PiggyBank,
  Check,
  ShieldAlert,
  X,
} from "lucide-react";

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onResolve: (id: number, estado: "CONFIRMADA" | "RECHAZADA") => void;
  categories: Category[];
  onUpdateCategory: (id: number, categoryId: number | null) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  isLoading,
  onResolve,
  categories,
  onUpdateCategory,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" className="text-[var(--color-primary-500)]" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl">
        <ShoppingBag className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-50" />
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          No hay transacciones registradas
        </h3>
      </div>
    );
  }

  const renderTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "INGRESO":
        return <ArrowDownLeft className="h-5 w-5 text-income" />;
      case "GASTO":
        return <ArrowUpRight className="h-5 w-5 text-expense" />;
      case "AHORRO":
        return <PiggyBank className="h-5 w-5 text-saving" />;
      case "TRANSFERENCIA":
        return <ArrowLeftRight className="h-5 w-5 text-text-secondary" />;
      default:
        return null;
    }
  };

  const renderBank = (tx: Transaction) => (
    <div className="break-words text-xs font-medium text-[var(--color-text-primary)]">
      <span>{tx.nombre_cuenta || "—"}</span>
      {tx.tipo_movimiento === "TRANSFERENCIA" && tx.nombre_cuenta_destino && (
        <span className="mt-1 block text-[10px] text-[var(--color-text-subtle)]">
          Destino: {tx.nombre_cuenta_destino}
        </span>
      )}
    </div>
  );

  const renderSource = (tx: Transaction) => {
    if (!tx.canal) return "—";
    if (tx.canal === "webhook") return "Automática";
    if (tx.canal === "efectivo") return "Manual";
    return tx.canal;
  };

  const renderCategory = (tx: Transaction) =>
    tx.tipo_movimiento === "TRANSFERENCIA" ? (
      <span className="text-xs text-[var(--color-text-subtle)]">
        Transferencia entre cuentas
      </span>
    ) : (
      <select
        aria-label={`Categoría de transacción ${tx.id_transaccion}`}
        value={tx.id_categoria ?? ""}
        onChange={(event) =>
          onUpdateCategory(
            tx.id_transaccion,
            event.target.value ? Number(event.target.value) : null,
          )
        }
        className="mx-auto block w-full max-w-full min-w-0 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-2 py-1.5 text-center text-xs text-[var(--color-text-primary)]"
      >
        <option value="">Sin categoría</option>
        {categories
          .filter(
            (category) =>
              category.estado !== false && category.tipo === tx.tipo_movimiento,
          )
          .map((category) => (
            <option key={category.id_categoria} value={category.id_categoria}>
              {category.nombre}
            </option>
          ))}
      </select>
    );

  const renderActions = (tx: Transaction) => {
    if (tx.estado !== "PENDIENTE") {
      return <span className="text-xs text-[var(--color-text-muted)]">—</span>;
    }
    if (tx.canal === "webhook" && tx.tipo_movimiento === "GASTO") {
      return (
        <Link
          to="/security"
          aria-label="Resolver el gasto pendiente desde Seguridad"
          title="Resolver desde Seguridad"
          className="mx-auto inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--color-border-subtle)] px-2 py-1.5 text-[10px] font-medium text-primary hover:bg-[var(--color-bg-surface-hover)]"
        >
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          <span>Seguridad</span>
        </Link>
      );
    }

    return (
      <div className="mx-auto flex max-w-28 flex-col items-center justify-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onResolve(tx.id_transaccion, "CONFIRMADA")}
          aria-label="Confirmar transacción pendiente"
          className="w-full px-1.5 py-1 text-[10px]"
        >
          <Check className="h-3.5 w-3.5 shrink-0" />
          <span>Confirmar</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onResolve(tx.id_transaccion, "RECHAZADA")}
          aria-label="Rechazar transacción pendiente"
          className="w-full px-1.5 py-1 text-[10px]"
        >
          <X className="h-3.5 w-3.5 shrink-0" />
          <span>Rechazar</span>
        </Button>
      </div>
    );
  };

  const renderDetails = (tx: Transaction) => (
    <>
      <div className="break-words text-xs font-semibold text-[var(--color-text-primary)]">
        {tx.comercio || tx.descripcion || "General"}
      </div>
      {tx.comercio && tx.descripcion && (
        <div className="mt-1 break-words text-[10px] text-[var(--color-text-subtle)]">
          {tx.descripcion}
        </div>
      )}
    </>
  );

  const renderAmount = (tx: Transaction) => (
    <span
      className={
        tx.tipo_movimiento === "INGRESO"
          ? "text-income"
          : tx.tipo_movimiento === "GASTO"
            ? "text-expense"
            : tx.tipo_movimiento === "AHORRO"
              ? "text-saving"
              : "text-text-secondary"
      }
    >
      {tx.tipo_movimiento === "INGRESO"
        ? "+"
        : tx.tipo_movimiento === "TRANSFERENCIA"
          ? "↔"
          : "-"}{" "}
      {formatCurrency(tx.monto)}
    </span>
  );

  const renderStatus = (tx: Transaction) => (
    <span className="inline-flex max-w-full justify-center break-all rounded-full border border-primary/20 bg-primary/10 px-1.5 py-1 text-[9px] font-semibold leading-tight text-primary sm:text-[10px]">
      {tx.estado ?? "Sin estado"}
    </span>
  );

  return (
    <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] table-fixed border-collapse text-center text-sm">
          <colgroup>
            <col className="w-[8%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[9%]" />
            <col className="w-[13%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-primary/30 bg-primary/20 text-[10px] font-bold uppercase leading-tight tracking-wide text-primary sm:text-xs">
              <th scope="col" className="px-2 py-4">
                Fecha
              </th>
              <th scope="col" className="px-2 py-4">
                Nombre del comercio
              </th>
              <th scope="col" className="px-2 py-4">
                Tipo de transacción
              </th>
              <th scope="col" className="px-2 py-4">
                Banco
              </th>
              <th scope="col" className="px-2 py-4">
                Riesgo
              </th>
              <th scope="col" className="px-2 py-4">
                Categoría
              </th>
              <th
                scope="col"
                className="px-2 py-4"
                title="Origen manual o automático"
              >
                Tipo
              </th>
              <th scope="col" className="px-2 py-4">
                Monto
              </th>
              <th scope="col" className="px-2 py-4">
                Estado
              </th>
              <th scope="col" className="px-2 py-4">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)] text-[var(--color-text-primary)]">
            {transactions.map((tx) => (
              <tr
                key={tx.id_transaccion}
                className="border-b border-[var(--color-border-subtle)] odd:bg-[var(--color-bg-surface)] even:bg-surface-hover/50 transition-colors last:border-b-0 hover:bg-primary/10"
              >
                <td className="whitespace-nowrap px-2 py-4 text-[10px] font-mono text-[var(--color-text-subtle)]">
                  {formatDate(tx.fecha_transaccion)}
                </td>
                <td className="break-words px-2 py-4">{renderDetails(tx)}</td>
                <td className="px-2 py-4">
                  <div className="flex flex-col items-center justify-center gap-1">
                    {renderTypeIcon(tx.tipo_movimiento)}
                    <span className="break-words text-[10px] font-medium leading-tight">
                      {tx.tipo_movimiento}
                    </span>
                  </div>
                </td>
                <td className="break-words px-2 py-4">{renderBank(tx)}</td>
                <td className="px-2 py-4">
                  <div className="flex justify-center">
                    <RiskBadge
                      nivel={tx.nivel_riesgo}
                      score={tx.score_anomalia}
                      esSospechosa={tx.es_sospechosa}
                    />
                  </div>
                </td>
                <td className="px-2 py-4">{renderCategory(tx)}</td>
                <td className="break-words px-2 py-4 text-[10px]">
                  {renderSource(tx)}
                </td>
                <td className="break-words px-2 py-4 text-xs font-semibold font-mono">
                  {renderAmount(tx)}
                </td>
                <td className="px-2 py-4">{renderStatus(tx)}</td>
                <td className="px-2 py-4">{renderActions(tx)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
