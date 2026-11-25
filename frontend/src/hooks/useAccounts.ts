import { useState, useEffect, useCallback } from "react";
import { AccountsApi } from "@/api/Accounts";
import { Account } from "@/types";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AccountsApi.getAccounts();
      setAccounts(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar las cuentas.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    isLoading,
    error,
    refetch: fetchAccounts,
  };
}
