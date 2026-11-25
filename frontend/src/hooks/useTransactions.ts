import { useState, useCallback, useEffect, useRef } from "react";
import { TransactionsApi } from "@/api/Transactions";
import {
  Transaction,
  TransactionFilters,
  CreateTransactionPayload,
} from "@/types/Transaction";
import { PaginationMetadata } from "@/types/Api";
import { useToast } from "@/components/ui/Toast";
import { useAccount } from "@/hooks/useAccount"; // Asumo hook estándar de cuenta

export const useTransactions = (initialFilters: TransactionFilters = {}) => {
  const { selectedAccount, refreshAccounts } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Guardamos los metadatos de paginación extraídos de PaginatedData
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    total_pages: 1,
  });

  const [filters, setFilters] = useState<TransactionFilters>({
    ...initialFilters,
    limit: 15,
    offset: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const requestId = useRef(0);
  const { showToast } = useToast();

  const fetchTransactions = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    try {
      const queryFilters: TransactionFilters = { ...filters };
      if (selectedAccount) {
        queryFilters.id_cuenta = selectedAccount.id_cuenta;
      } else {
        delete queryFilters.id_cuenta;
      }

      const response = await TransactionsApi.getAll(queryFilters);
      if (currentRequestId !== requestId.current) return;
      setTransactions(response.items);
      const metadata: PaginationMetadata = response.pagination;
      const limit = metadata.limit;
      const page =
        metadata.page ??
        Math.floor((metadata.offset ?? filters.offset ?? 0) / limit) + 1;
      setPagination({
        total: metadata.total,
        page,
        limit,
        total_pages:
          metadata.total_pages ?? (Math.ceil(metadata.total / limit) || 1),
      });
    } catch (error) {
      if (currentRequestId !== requestId.current) return;
      const err = error as Error;
      showToast({
        type: "error",
        title: "Error de conexión",
        message: err.message || "No se pudieron cargar las transacciones.",
      });
    } finally {
      if (currentRequestId === requestId.current) setIsLoading(false);
    }
  }, [filters, selectedAccount, showToast]);

  useEffect(() => {
    fetchTransactions();
    return () => {
      requestId.current += 1;
    };
  }, [fetchTransactions]);

  const updateFilters = (newFilters: Partial<TransactionFilters>) => {
    setFilters((prev: TransactionFilters) => ({
      ...prev,
      ...newFilters,
      offset: 0,
    }));
  };

  const changePage = (page: number) => {
    const limit = filters.limit ?? 15;
    setFilters((prev: TransactionFilters) => ({
      ...prev,
      offset: Math.max(0, page - 1) * limit,
    }));
  };

  const createTransaction = async (
    payload: CreateTransactionPayload,
  ): Promise<boolean> => {
    try {
      await TransactionsApi.create(payload);
      showToast({
        type: "success",
        title: "Transacción exitosa",
        message: "El movimiento se ha registrado correctamente.",
      });
      await Promise.all([fetchTransactions(), refreshAccounts()]);
      window.dispatchEvent(new Event("trida-transactions-updated"));
      window.dispatchEvent(new Event("trida-alerts-updated"));
      return true;
    } catch (error) {
      const err = error as Error;
      showToast({
        type: "error",
        title: "Error de registro",
        message: err.message || "No se pudo guardar la transacción.",
      });
    }
    return false;
  };

  const updateTransactionStatus = async (
    id: number,
    estado: "CONFIRMADA" | "RECHAZADA",
  ): Promise<boolean> => {
    try {
      await TransactionsApi.updateStatus(id, estado);
      showToast({
        type: "success",
        title: "Transacción actualizada",
        message:
          estado === "CONFIRMADA"
            ? "Transacción confirmada."
            : "Transacción rechazada.",
      });
      await Promise.all([fetchTransactions(), refreshAccounts()]);
      window.dispatchEvent(new Event("trida-transactions-updated"));
      window.dispatchEvent(new Event("trida-alerts-updated"));
      return true;
    } catch (error) {
      const err = error as Error;
      showToast({
        type: "error",
        title: "No se pudo resolver",
        message: err.message || "No se pudo actualizar el estado.",
      });
    }
    return false;
  };

  const updateTransactionCategory = async (
    id: number,
    categoryId: number | null,
  ): Promise<boolean> => {
    try {
      await TransactionsApi.updateCategory(id, categoryId);
      showToast({
        type: "success",
        title: "Categoría actualizada",
        message: "La categoría del movimiento fue actualizada.",
      });
      await fetchTransactions();
      return true;
    } catch (error) {
      const err = error as Error;
      showToast({
        type: "error",
        title: "No se pudo categorizar",
        message: err.message || "No se pudo actualizar la categoría.",
      });
      return false;
    }
  };

  return {
    transactions,
    pagination,
    filters,
    isLoading,
    updateFilters,
    changePage,
    createTransaction,
    updateTransactionStatus,
    updateTransactionCategory,
    refresh: fetchTransactions,
  };
};
