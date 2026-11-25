import { useState, useEffect, useCallback } from "react";
import { savingsApi } from "@/api/Savings";
import { useToast } from "@/components/ui/Toast";
import type {
  SavingsGoal,
  SavingsSummary,
  CreateSavingsGoalPayload,
  UpdateSavingsGoalPayload,
  CreateContributionPayload,
  EstadoMeta,
} from "@/types";

export function useSavings(initialEstado?: EstadoMeta) {
  const { showToast } = useToast();
  const [allGoals, setAllGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEstado, setSelectedEstado] = useState<EstadoMeta | undefined>(
    initialEstado,
  );

  const fetchSavings = useCallback(async () => {
    try {
      setLoading(true);
      setAllGoals(await savingsApi.getGoals());
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al cargar metas de ahorro";
      showToast({
        type: "error",
        title: "Error de Ahorro",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const goals = selectedEstado
    ? allGoals.filter((goal) => goal.estado === selectedEstado)
    : allGoals;
  const consideredGoals = allGoals.filter(
    (goal) => goal.estado !== "CANCELADA" && goal.estado !== "PAUSADA",
  );
  const totalAhorrado = consideredGoals.reduce(
    (total, goal) => total + goal.monto_actual,
    0,
  );
  const totalObjetivo = consideredGoals.reduce(
    (total, goal) => total + goal.monto_objetivo,
    0,
  );
  const summary: SavingsSummary = {
    total_ahorrado: totalAhorrado,
    total_objetivo: totalObjetivo,
    metas_activas: allGoals.filter((goal) => goal.estado === "ACTIVA").length,
    metas_completadas: allGoals.filter((goal) => goal.estado === "COMPLETADA")
      .length,
    porcentaje_general:
      totalObjetivo > 0 ? (totalAhorrado / totalObjetivo) * 100 : 0,
  };

  useEffect(() => {
    fetchSavings();
  }, [fetchSavings]);

  const createGoal = async (
    payload: CreateSavingsGoalPayload,
  ): Promise<boolean> => {
    try {
      const createdGoal = await savingsApi.createGoal(payload);
      showToast({
        type: "success",
        title:
          createdGoal.estado === "COMPLETADA" ? "¡Meta completada!" : "Meta creada",
        message:
          createdGoal.estado === "COMPLETADA"
            ? "Tu ahorro inicial alcanzó el objetivo."
            : "Tu meta de ahorro ha sido creada con éxito.",
      });
      await fetchSavings();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo crear la meta";
      showToast({
        type: "error",
        title: "Error al Crear Meta",
        message: msg,
      });
      return false;
    }
  };

  const updateGoal = async (
    id: number,
    payload: UpdateSavingsGoalPayload,
  ): Promise<boolean> => {
    try {
      await savingsApi.updateGoal(id, payload);
      showToast({
        type: "success",
        title: "Meta Actualizada",
        message: "Los cambios se han guardado con éxito.",
      });
      await fetchSavings();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo actualizar la meta";
      showToast({
        type: "error",
        title: "Error al Actualizar Meta",
        message: msg,
      });
      return false;
    }
  };

  const deleteGoal = async (id: number): Promise<boolean> => {
    try {
      await savingsApi.deleteGoal(id);
      showToast({
        type: "success",
        title: "Meta Eliminada",
        message: "La meta de ahorro ha sido eliminada.",
      });
      await fetchSavings();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo eliminar la meta";
      showToast({
        type: "error",
        title: "Error al Eliminar Meta",
        message: msg,
      });
      return false;
    }
  };

  const addContribution = async (
    payload: CreateContributionPayload,
  ): Promise<boolean> => {
    try {
      const updatedGoal = await savingsApi.addContribution(payload);
      showToast({
        type: "success",
        title:
          updatedGoal.estado === "COMPLETADA"
            ? "¡Meta completada!"
            : "Aporte registrado",
        message:
          updatedGoal.estado === "COMPLETADA"
            ? `¡Felicitaciones! Completaste tu meta "${updatedGoal.nombre}".`
            : "¡Excelente! Tu aporte ha sido sumado a la meta.",
      });
      await fetchSavings();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo registrar el aporte";
      showToast({
        type: "error",
        title: "Error en Aporte",
        message: msg,
      });
      return false;
    }
  };

  return {
    goals,
    summary,
    loading,
    selectedEstado,
    setSelectedEstado,
    refreshSavings: fetchSavings,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
  };
}
