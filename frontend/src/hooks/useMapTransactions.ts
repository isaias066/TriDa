import { useState, useEffect, useCallback, useRef } from "react";
import { mapApi } from "@/api/Map";
import { useToast } from "@/components/ui/Toast";
import type { GeoTransaction, MapSummary, MapFilters } from "@/types";
import { useAccount } from "@/hooks/useAccount";

export function useMapTransactions(initialFilters?: MapFilters) {
  const { showToast } = useToast();
  const { selectedAccount } = useAccount();
  const [transactions, setTransactions] = useState<GeoTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [summary, setSummary] = useState<MapSummary | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<GeoTransaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<MapFilters>(initialFilters || {});
  const requestId = useRef(0);

  const fetchMapData = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    try {
      setLoading(true);
      const queryFilters = {
        limit: 2000,
        ...filters,
        id_cuenta: selectedAccount?.id_cuenta,
      };
      const [locations, summaryData] = await Promise.all([
        mapApi.getGeoTransactions(queryFilters),
        mapApi.getMapSummary(selectedAccount?.id_cuenta),
      ]);
      if (currentRequestId !== requestId.current) return;
      setTransactions(locations.items);
      setTotal(locations.total);
      setTruncated(locations.truncated);
      setSummary(summaryData);
      setSelectedTransaction(
        (current) =>
          locations.items.find(
            (transaction) =>
              transaction.id_transaccion === current?.id_transaccion,
          ) ??
          locations.items[0] ??
          null,
      );
    } catch (err) {
      if (currentRequestId !== requestId.current) return;
      const msg =
        err instanceof Error ? err.message : "Error al cargar mapa de gastos";
      showToast({
        type: "error",
        title: "Error de Mapa",
        message: msg,
      });
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  }, [filters, selectedAccount?.id_cuenta, showToast]);

  useEffect(() => {
    fetchMapData();
    return () => {
      requestId.current += 1;
    };
  }, [fetchMapData]);

  const updateFilters = (newFilters: Partial<MapFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  return {
    transactions,
    total,
    truncated,
    summary,
    selectedTransaction,
    setSelectedTransaction,
    loading,
    filters,
    updateFilters,
    resetFilters,
    refreshMap: fetchMapData,
  };
}
