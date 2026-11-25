import React, { useState } from "react";
import { Edit2, Trash2, ShieldCheck } from "lucide-react";
import { Account } from "@/types";
import { formatCurrency, maskCardNumber } from "@/utils/Formatters";
import { AccountBadge } from "@/components/shared/AccountBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id_cuenta: number) => Promise<void>;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onEdit,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(account.id_cuenta);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <>
      <Card
        className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
        style={{
          background: `linear-gradient(145deg, ${account.color || "#8B5CF6"}22, var(--color-surface) 58%)`,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full blur-3xl"
          style={{
            background: `${account.color || "#8B5CF6"}2b`,
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: account.color || "var(--color-primary)" }}
        />

        <CardHeader className="relative flex flex-row items-center justify-between pb-2 pl-6">
          <div className="flex items-center gap-3 min-w-0">
            <AccountBadge tipo={account.tipo} showIconOnly />
            <div className="min-w-0">
              <CardTitle className="text-base truncate">
                {account.nombre}
              </CardTitle>
              {account.entidad && (
                <p className="text-xs text-text-muted truncate">
                  {account.entidad}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(account)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
              title="Editar cuenta"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="p-1.5 rounded-lg text-text-muted hover:text-expense hover:bg-expense/10 transition-colors"
              title="Eliminar cuenta"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-3 pl-6 pt-2">
          <div>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              Saldo actual
            </span>
            <p className="text-2xl font-extrabold text-text-primary tracking-tight">
              {formatCurrency(account.saldo_actual)}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-text-secondary">
            <span className="font-mono">
              {account.numero_enmascarado
                ? maskCardNumber(account.numero_enmascarado)
                : "•••• ••••"}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-income font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Activa
            </span>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="¿Desactivar esta cuenta?"
        description={`La cuenta "${account.nombre}" dejará de mostrarse y no aceptará nuevos movimientos.`}
        confirmText="Desactivar cuenta"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
};
