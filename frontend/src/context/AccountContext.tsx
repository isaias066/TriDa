/**
 * ¿Qué? Contexto global de selección de cuenta financiera.
 * ¿Para qué? Mantener una cuenta activa compartida por todas las vistas.
 */
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { AccountsApi } from "@/api/Accounts";
import { Account } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export interface AccountContextType {
  accounts: Account[];
  selectedAccountId: number | null;
  selectedAccount: Account | null;
  isLoading: boolean;
  loadError: string | null;
  setSelectedAccountId: (id: number) => void;
  refreshAccounts: () => Promise<void>;
  totalBalance: number;
}

export const AccountContext = createContext<AccountContextType | undefined>(
  undefined,
);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null,
  );
  const selectedAccountIdRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const storageKey = user?.id_usuario
    ? `trida:selected-account:${user.id_usuario}`
    : null;

  const refreshAccounts = useCallback(async () => {
    if (!isAuthenticated) {
      setAccounts([]);
      setSelectedAccountId(null);
      selectedAccountIdRef.current = null;
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await AccountsApi.getAccounts();
      const savedId = storageKey
        ? Number(localStorage.getItem(storageKey))
        : Number.NaN;
      const nextAccount =
        data.find(
          (account) => account.id_cuenta === selectedAccountIdRef.current,
        ) ??
        data.find((account) => account.id_cuenta === savedId) ??
        data[0];
      const nextAccountId = nextAccount?.id_cuenta ?? null;
      setAccounts(data);
      setSelectedAccountId(nextAccountId);
      selectedAccountIdRef.current = nextAccountId;
      if (storageKey && nextAccountId !== null) {
        localStorage.setItem(storageKey, String(nextAccountId));
      } else if (storageKey) {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "No se pudieron cargar las cuentas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, storageKey]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAccounts([]);
      setSelectedAccountId(null);
      selectedAccountIdRef.current = null;
      setIsLoading(false);
      setLoadError(null);
      return;
    }
    refreshAccounts();
  }, [isAuthenticated, refreshAccounts]);

  const selectAccount = useCallback(
    (id: number) => {
      if (!accounts.some((account) => account.id_cuenta === id)) return;
      setSelectedAccountId(id);
      selectedAccountIdRef.current = id;
      if (storageKey) localStorage.setItem(storageKey, String(id));
    },
    [accounts, storageKey],
  );

  const selectedAccount =
    selectedAccountId !== null
      ? accounts.find((a) => a.id_cuenta === selectedAccountId) || null
      : null;

  // Suma del saldo actual de todas las cuentas activas
  const totalBalance = accounts
    .filter((a) => a.estado)
    .reduce((sum, account) => sum + Number(account.saldo_actual || 0), 0);

  return (
    <AccountContext.Provider
      value={{
        accounts,
        selectedAccountId,
        selectedAccount,
        isLoading,
        loadError,
        setSelectedAccountId: selectAccount,
        refreshAccounts,
        totalBalance,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
