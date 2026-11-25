/**
 * ¿Qué? Pantalla principal (Dashboard) unificada.
 * ¿Para qué? Muestra el perfil del usuario y las estadísticas que expone la API.
 */
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { CategoryExpenseChart } from "@/components/dashboard/CategoryExpenseChart";
import { FinancialAdvisorWidget } from "@/components/dashboard/FinancialAdvisorWidget";
import { AlertBadge } from "@/components/alerts/AlertBadge";
import { formatCurrency, formatDate } from "@/utils/Formatters";
import { Link } from "react-router-dom";
import { Select } from "@/components/ui/Select";
import { useAccount } from "@/hooks/useAccount";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BellRing,
  PiggyBank,
  Wallet,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedAccount } = useAccount();

  const { data, isLoading, periodDays, setPeriodDays, markAdviceRead } =
    useDashboard();
  const periodOptions = [
    { value: 30, label: "Últimos 30 días" },
    { value: 90, label: "Últimos 90 días" },
    { value: 180, label: "Últimos 180 días" },
    { value: 365, label: "Último año" },
  ];

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-primary/25 bg-gradient-to-br from-primary/20 via-surface to-surface shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />
        <CardContent className="relative grid gap-6 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Tu panorama financiero
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Hola, {user?.nombre_completo?.split(" ")[0] || "bienvenido"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Revisa tus movimientos, cuida tu presupuesto y mantén tus finanzas
              bajo control desde un solo lugar.
            </p>
          </div>
          {selectedAccount && (
            <div className="min-w-0 rounded-2xl border border-border bg-surface/80 p-4 sm:min-w-64">
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <Wallet className="h-4 w-4 text-primary" />
                Cuenta activa
              </div>
              <p className="mt-2 truncate text-sm font-semibold text-text-primary">
                {selectedAccount.nombre}
              </p>
              <p className="mt-1 text-xl font-bold tracking-tight text-primary">
                {formatCurrency(selectedAccount.saldo_actual)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Resumen Financiero
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Datos de {selectedAccount?.nombre ?? "tu cuenta"} durante el periodo seleccionado.
            </p>
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={periodDays}
              onChange={(event) => setPeriodDays(Number(event.target.value))}
              options={periodOptions}
              aria-label="Periodo del resumen financiero"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Spinner size="lg" className="text-primary" />
          </div>
        ) : !data ? (
          <div className="text-center py-12 bg-surface border border-border rounded-xl text-sm text-text-muted shadow-sm">
            No se pudieron cargar los datos del resumen financiero.
          </div>
        ) : (
          <div className="space-y-6">
            <MetricsCards metrics={data.metrics} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <CategoryExpenseChart categories={data.categories} />
              <FinancialAdvisorWidget
                recommendations={data.advice}
                onMarkRead={markAdviceRead}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">
                    Transacciones recientes
                  </CardTitle>
                  <Link
                    to="/transactions"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Ver todas
                  </Link>
                </CardHeader>
                <CardContent>
                  {data.recentTransactions.length === 0 ? (
                    <p className="py-6 text-center text-sm text-text-muted">
                      No hay transacciones recientes para esta cuenta.
                    </p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {data.recentTransactions.map((transaction) => {
                        const Icon =
                          transaction.tipo_movimiento === "INGRESO"
                            ? ArrowDownLeft
                            : transaction.tipo_movimiento === "GASTO"
                              ? ArrowUpRight
                              : transaction.tipo_movimiento === "AHORRO"
                                ? PiggyBank
                                : ArrowLeftRight;
                        const color =
                          transaction.tipo_movimiento === "INGRESO"
                            ? "text-income"
                            : transaction.tipo_movimiento === "GASTO"
                              ? "text-expense"
                              : transaction.tipo_movimiento === "AHORRO"
                                ? "text-saving"
                                : "text-text-secondary";

                        return (
                          <li
                            key={transaction.id_transaccion}
                            className="flex items-center justify-between gap-3 py-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-text-primary">
                                  {transaction.tipo_movimiento ===
                                  "TRANSFERENCIA"
                                    ? "Transferencia entre cuentas"
                                    : transaction.comercio ||
                                      transaction.categoria.nombre}
                                </p>
                                <p className="text-xs text-text-muted">
                                  {transaction.tipo_movimiento} ·{" "}
                                  {formatDate(transaction.fecha_transaccion)}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`shrink-0 text-sm font-semibold ${color}`}
                            >
                              {formatCurrency(transaction.monto)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-risk-high" />
                    <CardTitle className="text-base">
                      Alertas recientes
                    </CardTitle>
                  </div>
                  <Link
                    to="/security"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Ver todas
                  </Link>
                </CardHeader>
                <CardContent>
                  {data.recentAlerts.length === 0 ? (
                    <p className="py-6 text-center text-sm text-text-muted">
                      No hay alertas para esta cuenta.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {data.recentAlerts.map((alert) => (
                        <li
                          key={alert.id_alerta}
                          className="rounded-lg border border-border p-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium text-text-primary">
                              {alert.comercio || "Transacción sin comercio"}
                            </p>
                            <div className="flex gap-2">
                              <AlertBadge severidad={alert.severidad} />
                              <AlertBadge estado={alert.estado} />
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-text-secondary">
                            {alert.motivo}
                          </p>
                          <p className="mt-1 text-xs text-text-muted">
                            {formatCurrency(alert.monto)} ·{" "}
                            {formatDate(alert.fecha_detectada)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
