/**
 * ¿Qué? Dropdown selector de cuenta en la Sidebar (reemplaza SidebarBankSelector).
 */
import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Wallet,
  Check,
  CreditCard,
  Building2,
  Landmark,
} from "lucide-react";
import { useAccount } from "@/hooks/useAccount";
import { formatCurrency } from "@/utils/Formatters";
import { AccountType } from "@/types";

export const SidebarAccountSelector: React.FC = () => {
  const { accounts, selectedAccountId, setSelectedAccountId, totalBalance } =
    useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[aria-checked="true"]')
      ?.focus();
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitemradio"]',
      ) ?? [],
    );
    if (items.length === 0) return;

    event.preventDefault();
    const activeIndex = items.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    const currentIndex =
      activeIndex >= 0
        ? activeIndex
        : items.findIndex((item) => item.getAttribute("aria-checked") === "true");
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : (currentIndex +
              (event.key === "ArrowDown" ? 1 : -1) +
              items.length) %
            items.length;
    items[nextIndex]?.focus();
  };

  const getAccountIcon = (tipo?: AccountType) => {
    switch (tipo) {
      case "BANCO":
        return <Landmark className="w-4 h-4 text-primary" />;
      case "TARJETA":
        return <CreditCard className="w-4 h-4 text-saving" />;
      case "BILLETERA":
        return <Building2 className="w-4 h-4 text-income" />;
      default:
        return <Wallet className="w-4 h-4 text-budget-warn" />;
    }
  };

  const selectedAccount = accounts.find(
    (a) => a.id_cuenta === selectedAccountId,
  );

  return (
    <div
      className="px-3 py-3 border-b border-border"
      ref={dropdownRef}
    >
      <p className="block text-[10px] font-semibold tracking-wider text-text-muted uppercase mb-1 px-1">
        Cuenta seleccionada
      </p>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => accounts.length > 1 && setIsOpen(!isOpen)}
        disabled={accounts.length < 2}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="sidebar-account-menu"
        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-all text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-md bg-surface-hover border border-border shrink-0">
            {selectedAccount ? (
              getAccountIcon(selectedAccount.tipo)
            ) : (
              <Wallet className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">
              {selectedAccount ? selectedAccount.nombre : "Crea tu primera cuenta"}
            </p>
            <p className="text-[11px] font-medium text-text-secondary">
              {selectedAccount
                ? formatCurrency(selectedAccount.saldo_actual)
                : formatCurrency(totalBalance)}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div
          id="sidebar-account-menu"
          ref={menuRef}
          role="menu"
          aria-label="Seleccionar cuenta financiera"
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="absolute left-3 right-3 mt-1.5 z-50 rounded-xl bg-surface border border-border shadow-xl p-1 max-h-60 overflow-y-auto"
        >
          {/* Cuentas individuales */}
          {accounts.map((account) => {
            const isSelected = selectedAccountId === account.id_cuenta;
            return (
              <button
                key={account.id_cuenta}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => {
                  setSelectedAccountId(account.id_cuenta);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-text-primary hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getAccountIcon(account.tipo)}
                  <div className="truncate text-left">
                    <p className="truncate">{account.nombre}</p>
                    <p className="text-[10px] text-text-muted font-normal">
                      {formatCurrency(account.saldo_actual)}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
