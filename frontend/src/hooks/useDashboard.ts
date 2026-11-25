import { useState, useCallback, useEffect, useRef } from "react";
import { DashboardApi } from "@/api/Dashboard";
import { DashboardViewData } from "@/types/Dashboard";
import { useToast } from "@/components/ui/Toast";
import { useAccount } from "@/hooks/useAccount";

export const useDashboard = () => {
  const [data, setData] = useState<DashboardViewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [periodDays, setPeriodDays] = useState(30);
  const { showToast } = useToast();
  const { selectedAccount } = useAccount();
  const requestId = useRef(0);

  const fetchDashboardData = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    setData(null);
    setIsLoading(true);
    try {
      const metrics = await DashboardApi.getStats(
        selectedAccount?.id_cuenta,
        periodDays,
      );
      if (currentRequestId !== requestId.current) return;
      const [recentAlerts, recentTransactions, categories, advice] =
        await Promise.all([
          DashboardApi.getRecentAlerts(selectedAccount?.id_cuenta),
          DashboardApi.getRecentTransactions(selectedAccount?.id_cuenta),
          DashboardApi.getCategoryExpenses(
            selectedAccount?.id_cuenta,
            metrics.periodo,
          ),
          DashboardApi.getAdvice(selectedAccount?.id_cuenta),
        ]);
      if (currentRequestId !== requestId.current) return;
      setData({
        metrics,
        recentAlerts,
        recentTransactions,
        categories,
        advice,
      });
    } catch (error) {
      if (currentRequestId !== requestId.current) return;
      const err = error as Error;
      showToast({
        type: "error",
        title: "Error de carga",
        message:
          err.message || "No se pudieron actualizar los datos del Dashboard.",
      });
    } finally {
      if (currentRequestId === requestId.current) setIsLoading(false);
    }
  }, [periodDays, selectedAccount?.id_cuenta, showToast]);

  useEffect(() => {
    fetchDashboardData();
    return () => {
      requestId.current += 1;
    };
  }, [fetchDashboardData]);

  const markAdviceRead = useCallback(
    async (id: number) => {
      try {
        await DashboardApi.markAdviceRead(id);
        setData((current) =>
          current
            ? {
                ...current,
                advice: current.advice.filter(
                  (advice) => advice.id_consejo !== id,
                ),
              }
            : current,
        );
      } catch (error) {
        const err = error as Error;
        showToast({
          type: "error",
          title: "No se pudo actualizar el consejo",
          message: err.message || "Inténtalo de nuevo.",
        });
      }
    },
    [showToast],
  );

  return {
    data,
    isLoading,
    periodDays,
    setPeriodDays,
    refreshDashboard: fetchDashboardData,
    markAdviceRead,
  };
};
