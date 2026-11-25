import React, { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useAccount } from "@/hooks/useAccount";
import { TransactionFiltersBar } from "@/components/transactions/TransactionsFilterBar";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { NewTransactionModal } from "@/components/transactions/NewTransactionModal";
import { TransactionRetentionPanel } from "@/components/transactions/TransactionRetentionPanel";
import { Button } from "@/components/ui/Button";
import { Plus, ArrowLeft, ArrowRight } from "lucide-react";

export const TransactionsPage: React.FC = () => {
  const { selectedAccount, accounts } = useAccount();
  const { categories } = useCategories();
  const {
    transactions,
    pagination,
    filters,
    isLoading,
    refresh,
    updateFilters,
    changePage,
    createTransaction,
    updateTransactionStatus,
    updateTransactionCategory,
  } = useTransactions();

  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const hasCashAccount = accounts.some(
    (account) => account.estado && account.tipo === "EFECTIVO",
  );

  const handleResetFilters = () => {
    updateFilters({
      tipo_movimiento: undefined,
      id_categoria: undefined,
      nivel_riesgo: undefined,
      estado: undefined,
      search: undefined,
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Transacciones
          </h1>
          <p className="text-sm text-[var(--color-text-subtle)] mt-1">
            {selectedAccount
              ? `Cuenta actual: ${selectedAccount.nombre}`
              : "Mostrando todas tus cuentas"}
          </p>
        </div>

        <Button
          onClick={() => setIsNewModalOpen(true)}
          disabled={!hasCashAccount}
          className="flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Transacción
        </Button>
      </div>
      {!hasCashAccount && (
        <p role="status" className="text-sm text-text-secondary">
          Para registrar movimientos manualmente, primero agrega una cuenta de
          efectivo. Las demás cuentas recibirán movimientos desde la
          integración.
        </p>
      )}

      <TransactionRetentionPanel onPurged={refresh} />

      <TransactionFiltersBar
        filters={filters}
        categories={categories}
        onFilterChange={updateFilters}
        onReset={handleResetFilters}
      />

      <TransactionsTable
        transactions={transactions}
        isLoading={isLoading}
        categories={categories}
        onResolve={(id, estado) => void updateTransactionStatus(id, estado)}
        onUpdateCategory={(id, categoryId) =>
          void updateTransactionCategory(id, categoryId)
        }
      />

      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-4">
          <span className="text-xs text-[var(--color-text-subtle)]">
            Página {pagination.page} de {pagination.total_pages} (Total:{" "}
            {pagination.total})
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => changePage(pagination.page - 1)}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.total_pages}
              onClick={() => changePage(pagination.page + 1)}
              className="flex items-center gap-1"
            >
              Siguiente <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <NewTransactionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        categories={categories}
        onSubmit={createTransaction}
      />
    </div>
  );
};
