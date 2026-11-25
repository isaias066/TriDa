/**
 * ¿Qué? Página principal para listar, crear y administrar las cuentas del usuario.
 */
import React, { useState } from "react";
import { Plus, Wallet, Landmark, CreditCard, RefreshCw } from "lucide-react";
import { useAccount } from "@/hooks/useAccount";
import { AccountsApi } from "@/api/Accounts";
import { Account, CreateAccountPayload, UpdateAccountPayload } from "@/types";
import { formatCurrency } from "@/utils/Formatters";
import { AccountCard } from "@/components/accounts/AccountCard";
import { NewAccountModal } from "@/components/accounts/NewAccountModal";
import { EditAccountModal } from "@/components/accounts/EditAccountModal";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export const AccountsPage: React.FC = () => {
  const { accounts, isLoading, refreshAccounts, totalBalance } = useAccount();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleCreate = async (payload: CreateAccountPayload) => {
    await AccountsApi.createAccount(payload);
    await refreshAccounts();
  };

  const handleUpdate = async (
    id_cuenta: number,
    payload: UpdateAccountPayload,
  ) => {
    await AccountsApi.updateAccount(id_cuenta, payload);
    await refreshAccounts();
  };

  const handleDelete = async (id_cuenta: number) => {
    await AccountsApi.deleteAccount(id_cuenta);
    await refreshAccounts();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header con título y botón de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Mis Cuentas Financieras
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Administra tus tarjetas, cuentas de ahorros, billeteras y efectivo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAccounts}
            title="Refrescar cuentas"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsNewModalOpen(true)}
          >
            Nueva cuenta
          </Button>
        </div>
      </div>

      {/* Tarjeta de Resumen Global */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-text-muted uppercase">
              Patrimonio Total en Cuentas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-primary">
              {formatCurrency(totalBalance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-text-muted uppercase">
              Total Cuentas Registradas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-income" />
            <span className="text-2xl font-bold text-text-primary">
              {accounts.length}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-text-muted uppercase">
              Tipos Activos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <Landmark className="w-4 h-4 text-primary" />
              <span>
                {accounts.filter((a) => a.tipo === "BANCO").length} Bancos
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <CreditCard className="w-4 h-4 text-saving" />
              <span>
                {accounts.filter((a) => a.tipo === "TARJETA").length} Tarjetas
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido Principal: Lista de Cuentas */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Spinner size="lg" />
        </div>
      ) : accounts.length === 0 ? (
        <Card className="text-center py-12 px-4 border-dashed">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-3">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">
            No tienes cuentas registradas
          </h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto mt-1 mb-4">
            Registra tu primera cuenta para continuar. Después podrás trabajar
            con ella y cambiar de cuenta cuando lo necesites.
          </p>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsNewModalOpen(true)}
          >
            Agregar mi primera cuenta
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id_cuenta}
              account={account}
              onEdit={(acc) => setEditingAccount(acc)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <NewAccountModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreate}
      />

      <EditAccountModal
        isOpen={!!editingAccount}
        account={editingAccount}
        onClose={() => setEditingAccount(null)}
        onSubmit={handleUpdate}
      />
    </div>
  );
};
