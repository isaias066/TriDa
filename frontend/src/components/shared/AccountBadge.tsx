/**
 * ¿Qué? Insignia (badge) para representar visualmente el tipo de cuenta financiera.
 * ¿Para qué? Reemplazar el antiguo BankBadge en tablas, tarjetas y dropdowns.
 */
import React from "react";
import { Landmark, CreditCard, Building2, Wallet } from "lucide-react";
import { AccountType } from "@/types";
import { cn } from "@/utils/cn";

interface AccountBadgeProps {
  tipo: AccountType;
  nombre?: string;
  showIconOnly?: boolean;
  className?: string;
}

export const AccountBadge: React.FC<AccountBadgeProps> = ({
  tipo,
  nombre,
  showIconOnly = false,
  className,
}) => {
  const getBadgeMeta = () => {
    switch (tipo) {
      case "BANCO":
        return {
          label: nombre || "Banco",
          icon: Landmark,
          classes: "bg-primary/10 text-primary border-primary/20",
        };
      case "TARJETA":
        return {
          label: nombre || "Tarjeta",
          icon: CreditCard,
          classes: "bg-saving/10 text-saving border-saving/20",
        };
      case "BILLETERA":
        return {
          label: nombre || "Billetera",
          icon: Building2,
          classes: "bg-income/10 text-income border-income/20",
        };
      case "EFECTIVO":
      default:
        return {
          label: nombre || "Efectivo",
          icon: Wallet,
          classes: "bg-budget-warn/10 text-budget-warn border-budget-warn/20",
        };
    }
  };

  const meta = getBadgeMeta();
  const Icon = meta.icon;

  if (showIconOnly) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center p-2 rounded-lg border",
          meta.classes,
          className,
        )}
        title={meta.label}
      >
        <Icon className="w-4 h-4" />
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider",
        meta.classes,
        className,
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{meta.label}</span>
    </span>
  );
};
