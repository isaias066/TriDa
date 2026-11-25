import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BudgetCard } from "./BudgetCard";

afterEach(cleanup);

describe("BudgetCard accessibility", () => {
  it("labels its action buttons and progress value", () => {
    render(
      <BudgetCard
        budget={{
          id_presupuesto: 1,
          id_categoria: 3,
          limite_mensual: 100000,
          mes: 11,
          anio: 2026,
          fecha_creacion: "2026-11-01T00:00:00.000Z",
          gastado: 85000,
          categoria: { nombre: "Alimentación" },
        }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Editar presupuesto de Alimentación" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Eliminar presupuesto de Alimentación",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("progressbar", { name: "Presupuesto de Alimentación" })
        .getAttribute("aria-valuenow"),
    ).toBe("85");
  });
});
