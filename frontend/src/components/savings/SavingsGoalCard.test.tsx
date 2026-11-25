import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SavingsGoalCard } from "./SavingsGoalCards";

afterEach(cleanup);

describe("SavingsGoalCard accessibility", () => {
  it("labels its action buttons and progress value", () => {
    render(
      <SavingsGoalCard
        goal={{
          id_meta: 1,
          nombre: "Fondo de emergencia",
          monto_objetivo: 1000000,
          monto_actual: 250000,
          progreso: 25,
          fecha_limite: null,
          estado: "ACTIVA",
          fecha_creacion: "2026-11-01T00:00:00.000Z",
        }}
        onContribute={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Editar meta Fondo de emergencia",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Eliminar meta Fondo de emergencia",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("progressbar", {
        name: "Progreso de la meta Fondo de emergencia",
      }).getAttribute("aria-valuenow"),
    ).toBe("25");
  });
});
