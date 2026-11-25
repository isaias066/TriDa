import { useState, useEffect, useCallback } from "react";
import { insightsApi } from "@/api/Insights";
import { useToast } from "@/components/ui/Toast";
import type { InsightsOverview } from "@/types";
import { useAccount } from "@/hooks/useAccount";

export function useInsights() {
  const { showToast } = useToast();
  const [overview, setOverview] = useState<InsightsOverview | null>(null);
  const [periodDays, setPeriodDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const { selectedAccountId } = useAccount();

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setOverview(await insightsApi.getOverview(periodDays, selectedAccountId ?? undefined));
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al cargar el análisis";
      showToast({
        type: "error",
        title: "Error de Asesoría Financiera",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  }, [periodDays, selectedAccountId, showToast]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    overview,
    periodDays,
    setPeriodDays,
    loading,
    refreshInsights: fetchOverview,
  };
}
