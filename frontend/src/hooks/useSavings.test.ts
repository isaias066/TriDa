import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { createElement, type PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SavingsGoal } from "@/types/Savings";
import { useSavings } from "./useSavings";

const mocks = vi.hoisted(() => ({
  getGoals: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("@/api/Savings", () => ({
  savingsApi: { getGoals: mocks.getGoals },
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ showToast: mocks.showToast }),
}));

const wrapper = ({ children }: PropsWithChildren) =>
  createElement("div", null, children);

afterEach(() => {
  cleanup();
});

describe("useSavings", () => {
  beforeEach(() => {
    mocks.getGoals.mockReset();
    mocks.showToast.mockReset();
  });

  it("excludes paused and cancelled goals from savings totals", async () => {
    const goals: SavingsGoal[] = [
      {
        id_meta: 1,
        nombre: "Activa",
        monto_objetivo: 100,
        monto_actual: 25,
        progreso: 25,
        fecha_limite: null,
        estado: "ACTIVA",
        fecha_creacion: "2026-01-01T00:00:00.000Z",
      },
      {
        id_meta: 2,
        nombre: "Completada",
        monto_objetivo: 100,
        monto_actual: 100,
        progreso: 100,
        fecha_limite: null,
        estado: "COMPLETADA",
        fecha_creacion: "2026-01-02T00:00:00.000Z",
      },
      {
        id_meta: 3,
        nombre: "Pausada",
        monto_objetivo: 200,
        monto_actual: 50,
        progreso: 25,
        fecha_limite: null,
        estado: "PAUSADA",
        fecha_creacion: "2026-01-03T00:00:00.000Z",
      },
      {
        id_meta: 4,
        nombre: "Cancelada",
        monto_objetivo: 300,
        monto_actual: 75,
        progreso: 25,
        fecha_limite: null,
        estado: "CANCELADA",
        fecha_creacion: "2026-01-04T00:00:00.000Z",
      },
    ];
    mocks.getGoals.mockResolvedValue(goals);

    const { result } = renderHook(() => useSavings(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.summary).toEqual({
      total_ahorrado: 125,
      total_objetivo: 200,
      metas_activas: 1,
      metas_completadas: 1,
      porcentaje_general: 62.5,
    });
  });
});
