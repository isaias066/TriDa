import { useState, useEffect, useCallback } from "react";
import { budgetsApi } from "@/api/Budgets";
import { useToast } from "@/components/ui/Toast";
import type {
  Budget,
  BudgetSummary,
  BudgetFilters,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from "@/types";
import { useAccount } from "@/hooks/useAccount";
import { dateOnlyInBogota } from "@/utils/Date";

export function useBudgets(initialFilters?: BudgetFilters) {
  const { showToast } = useToast();
  const { selectedAccount } = useAccount();
  const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const todayInBogota = dateOnlyInBogota(new Date());
  const [currentYear, currentMonth] = todayInBogota.split("-").map(Number);
  const [filters, setFilters] = useState<BudgetFilters>({
    mes: initialFilters?.mes ?? currentMonth,
    anio: initialFilters?.anio ?? currentYear,
    ...initialFilters,
  });

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAllBudgets(
        await budgetsApi.getBudgets({
          mes: filters.mes,
          anio: filters.anio,
          id_cuenta: selectedAccount?.id_cuenta,
        }),
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al cargar presupuestos";
      setError(msg);
      showToast({
        type: "error",
        title: "Error de Presupuestos",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  }, [filters.mes, filters.anio, selectedAccount?.id_cuenta, showToast]);

  const budgets = allBudgets.filter((budget) => {
    if (filters.mes !== undefined && budget.mes !== filters.mes) return false;
    if (filters.anio !== undefined && budget.anio !== filters.anio)
      return false;
    if (
      filters.id_categoria !== undefined &&
      budget.id_categoria !== filters.id_categoria
    ) {
      return false;
    }
    return true;
  });

  const totalPresupuestado = budgets.reduce(
    (total, budget) => total + budget.limite_mensual,
    0,
  );
  const totalGastado = budgets.reduce(
    (total, budget) => total + budget.gastado,
    0,
  );
  const summary: BudgetSummary = {
    total_presupuestado: totalPresupuestado,
    total_gastado: totalGastado,
    porcentaje_total:
      totalPresupuestado > 0 ? (totalGastado / totalPresupuestado) * 100 : 0,
    presupuestos_en_alerta: budgets.filter(
      (budget) =>
        budget.gastado >= budget.limite_mensual * 0.8 &&
        budget.gastado < budget.limite_mensual,
    ).length,
    presupuestos_excedidos: budgets.filter(
      (budget) => budget.gastado >= budget.limite_mensual,
    ).length,
    total_presupuestos: budgets.length,
  };

  useEffect(() => {
    fetchBudgets();
    window.addEventListener("trida-transactions-updated", fetchBudgets);
    return () =>
      window.removeEventListener("trida-transactions-updated", fetchBudgets);
  }, [fetchBudgets]);

  const createBudget = async (
    payload: CreateBudgetPayload,
  ): Promise<boolean> => {
    try {
      await budgetsApi.createBudget(payload);
      showToast({
        type: "success",
        title: "Presupuesto Creado",
        message: "El presupuesto ha sido registrado exitosamente.",
      });
      await fetchBudgets();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo crear el presupuesto";
      showToast({
        type: "error",
        title: "Error al Crear",
        message: msg,
      });
      return false;
    }
  };

  const updateBudget = async (
    id: number,
    payload: UpdateBudgetPayload,
  ): Promise<boolean> => {
    try {
      await budgetsApi.updateBudget(id, payload);
      showToast({
        type: "success",
        title: "Presupuesto Actualizado",
        message: "Los cambios se han guardado con éxito.",
      });
      await fetchBudgets();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el presupuesto";
      showToast({
        type: "error",
        title: "Error al Actualizar",
        message: msg,
      });
      return false;
    }
  };

  const deleteBudget = async (id: number): Promise<boolean> => {
    try {
      await budgetsApi.deleteBudget(id);
      showToast({
        type: "success",
        title: "Presupuesto Eliminado",
        message: "El presupuesto ha sido eliminado correctamente.",
      });
      await fetchBudgets();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el presupuesto";
      showToast({
        type: "error",
        title: "Error al Eliminar",
        message: msg,
      });
      return false;
    }
  };

  return {
    budgets,
    summary,
    loading,
    error,
    filters,
    setFilters,
    refreshBudgets: fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
  };
}
