import { useState, useCallback, useEffect, useRef } from "react";
import { AlertsApi } from "@/api/Alerts";
import {
  FraudAlert,
  ListAlertsQueryParams,
  AlertUserAction,
  AlertStatus,
} from "@/types/Alert";
import { useToast } from "@/components/ui/Toast";
import { useAccount } from "@/hooks/useAccount";

export const useAlerts = (initialParams: ListAlertsQueryParams = {}) => {
  const { selectedAccountId, refreshAccounts } = useAccount();
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    total_pages: 1,
  });

  const [queryParams, setQueryParams] = useState<ListAlertsQueryParams>({
    limit: 15,
    offset: 0,
    sort_by: "fecha_detectada",
    sort_order: "desc",
    ...initialParams,
    id_cuenta: selectedAccountId ?? undefined,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const requestId = useRef(0);
  const pendingCountRequestId = useRef(0);
  const isMounted = useRef(false);

  useEffect(() => {
    setQueryParams((prev) => ({
      ...prev,
      id_cuenta: selectedAccountId ?? undefined,
      offset: 0,
    }));
  }, [selectedAccountId]);

  const fetchPendingCount = useCallback(async () => {
    if (!isMounted.current) return;
    const currentRequestId = ++pendingCountRequestId.current;
    try {
      const response = await AlertsApi.getPendingCount(selectedAccountId ?? undefined);
      if (
        !isMounted.current ||
        currentRequestId !== pendingCountRequestId.current
      ) {
        return;
      }
      setPendingCount(response.count);
      window.dispatchEvent(new Event("trida-alerts-updated"));
    } catch (error) {
      if (
        !isMounted.current ||
        currentRequestId !== pendingCountRequestId.current
      ) {
        return;
      }
      const err = error as Error;
      showToast({
        type: "error",
        title: "Error de conexión",
        message: err.message || "No se pudo actualizar el contador de alertas.",
      });
    }
  }, [selectedAccountId, showToast]);

  const fetchAlerts = useCallback(async () => {
    if (!isMounted.current) return;
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    try {
      const response = await AlertsApi.getAll(queryParams);
      if (!isMounted.current || currentRequestId !== requestId.current) return;
      setAlerts(response.items);

      const { pagination: responsePagination } = response;
      const limit = responsePagination.limit || queryParams.limit || 15;
      const total = responsePagination.total;
      const totalPages = Math.ceil(total / limit) || 1;
      const currentPage =
        Math.floor(
          (responsePagination.offset ?? queryParams.offset ?? 0) / limit,
        ) + 1;

      setPagination({
        total,
        page: currentPage,
        limit,
        total_pages: totalPages,
      });
    } catch (error) {
      if (!isMounted.current || currentRequestId !== requestId.current) return;
      const err = error as Error;
      showToast({
        type: "error",
        title: "Error de conexión",
        message: err.message || "No se pudieron cargar las alertas.",
      });
    } finally {
      if (isMounted.current && currentRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [queryParams, showToast]);

  useEffect(() => {
    isMounted.current = true;
    fetchAlerts();
    fetchPendingCount();
    return () => {
      isMounted.current = false;
      requestId.current += 1;
      pendingCountRequestId.current += 1;
    };
  }, [fetchAlerts, fetchPendingCount]);

  const updateFilters = (newParams: Partial<ListAlertsQueryParams>) => {
    setQueryParams((prev: ListAlertsQueryParams) => ({
      ...prev,
      ...newParams,
      offset: 0,
    }));
  };

  const changePage = (page: number) => {
    const limit = queryParams.limit || 15;
    const offset = (page - 1) * limit;
    setQueryParams((prev: ListAlertsQueryParams) => ({ ...prev, offset }));
  };

  const resolveAlert = async (
    id: number,
    accion: AlertUserAction,
  ): Promise<boolean> => {
    try {
      // Si el usuario reconoce la transacción ("FUI_YO"), la alerta se descarta.
      // De lo contrario ("NO_FUI_YO" o "BLOQUEAR_TARJETA"), se confirma la alerta de fraude.
      const nuevoEstado: AlertStatus =
        accion === "FUI_YO" ? "DESCARTADA" : "CONFIRMADA";

      await AlertsApi.updateStatus(id, {
        estado: nuevoEstado,
        accion_usuario: accion,
      });

      if (!isMounted.current) return true;
      showToast({
        type: "success",
        title: "Alerta actualizada",
        message: "Tu acción de seguridad ha sido registrada exitosamente.",
      });
      await refreshAccounts();
      void fetchAlerts();
      void fetchPendingCount();
      return true;
    } catch (error) {
      if (!isMounted.current) return false;
      const err = error as Error;
      showToast({
        type: "error",
        title: "Error de actualización",
        message: err.message || "No se pudo procesar la respuesta a la alerta.",
      });
    }
    return false;
  };

  return {
    alerts,
    pendingCount,
    pagination,
    queryParams,
    isLoading,
    updateFilters,
    changePage,
    resolveAlert,
    refresh: fetchAlerts,
  };
};
