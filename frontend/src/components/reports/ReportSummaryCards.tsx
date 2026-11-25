import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/utils/Formatters";
import type { FinancialReportSummary } from "@/types";

interface ReportSummaryCardsProps {
  summary: FinancialReportSummary | undefined;
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  const ingresos = summary?.total_ingresos ?? 0;
  const gastos = summary?.total_gastos ?? 0;
  const balance = summary?.balance_neto ?? 0;
  const tasaAhorro = summary?.tasa_ahorro ?? 0;

  const isBalancePositive = balance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Ingresos */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Total Ingresos
          </p>
          <p className="text-xl font-bold text-[var(--color-success)] mt-1">
            {formatCurrency(ingresos)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-success-light)] text-[var(--color-success)] flex items-center justify-center">
          <TrendingUp className="w-5 h-5" />
        </div>
      </Card>

      {/* Total Gastos */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Total Gastos
          </p>
          <p className="text-xl font-bold text-[var(--color-danger)] mt-1">
            {formatCurrency(gastos)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-danger-light)] text-[var(--color-danger)] flex items-center justify-center">
          <TrendingDown className="w-5 h-5" />
        </div>
      </Card>

      {/* Balance Neto */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Balance Neto
          </p>
          <p
            className={`text-xl font-bold mt-1 ${
              isBalancePositive
                ? "text-[var(--color-success)]"
                : "text-[var(--color-danger)]"
            }`}
          >
            {formatCurrency(balance)}
          </p>
          <span className="text-2xs text-[var(--color-text-muted)]">
            {isBalancePositive ? "Superávit financiero" : "Déficit en periodo"}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
          <DollarSign className="w-5 h-5" />
        </div>
      </Card>

      {/* Tasa de Ahorro */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Tasa de Ahorro
          </p>
          <p className="text-xl font-bold text-[var(--color-primary)] mt-1">
            {Math.max(0, tasaAhorro).toFixed(1)}%
          </p>
          <span className="text-2xs text-[var(--color-text-muted)]">
            Porcentaje de ingresos destinado al ahorro
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
          <PiggyBank className="w-5 h-5" />
        </div>
      </Card>
    </div>
  );
}
