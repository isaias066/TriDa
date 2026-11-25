import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewBudgetModal } from "./NewBudgetModal";

vi.mock("@/hooks/useCategories", () => ({
  useCategories: () => ({
    categories: [{ id_categoria: 1, nombre: "Comida", tipo: "GASTO" }],
  }),
}));

afterEach(cleanup);

describe("NewBudgetModal", () => {
  it("resets entered values when cancelled", () => {
    const props = {
      onClose: vi.fn(),
      onSubmit: vi.fn(),
      currentMonth: 1,
      currentYear: 2026,
    };
    const { rerender } = render(<NewBudgetModal {...props} isOpen />);

    fireEvent.change(screen.getByLabelText("Categoría de Gasto *"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Monto Límite (COP) *"), {
      target: { value: "500000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    rerender(<NewBudgetModal {...props} isOpen={false} />);
    rerender(<NewBudgetModal {...props} isOpen />);

    expect(
      (screen.getByLabelText("Categoría de Gasto *") as HTMLSelectElement)
        .value,
    ).toBe("");
    expect(
      (screen.getByLabelText("Monto Límite (COP) *") as HTMLInputElement).value,
    ).toBe("");
    expect(props.onClose).toHaveBeenCalledOnce();
  });
});
