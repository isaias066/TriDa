import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewSavingsGoalModal } from "./NewSavingsGoalModal";

afterEach(cleanup);

describe("NewSavingsGoalModal", () => {
  it("resets entered values when cancelled", () => {
    const props = { onClose: vi.fn(), onSubmit: vi.fn() };
    const { rerender } = render(<NewSavingsGoalModal {...props} isOpen />);

    fireEvent.change(screen.getByLabelText("Nombre de la Meta *"), {
      target: { value: "Meta temporal" },
    });
    fireEvent.change(screen.getByLabelText("Monto Objetivo (COP) *"), {
      target: { value: "3000000" },
    });
    fireEvent.change(screen.getByLabelText("Ahorro Inicial (Opcional)"), {
      target: { value: "500000" },
    });
    fireEvent.change(screen.getByLabelText("Fecha Límite (Opcional)"), {
      target: { value: "2026-12-31" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    rerender(<NewSavingsGoalModal {...props} isOpen={false} />);
    rerender(<NewSavingsGoalModal {...props} isOpen />);

    expect(
      (screen.getByLabelText("Nombre de la Meta *") as HTMLInputElement).value,
    ).toBe("");
    expect(
      (screen.getByLabelText("Monto Objetivo (COP) *") as HTMLInputElement)
        .value,
    ).toBe("");
    expect(
      (screen.getByLabelText("Ahorro Inicial (Opcional)") as HTMLInputElement)
        .value,
    ).toBe("");
    expect(
      (screen.getByLabelText("Fecha Límite (Opcional)") as HTMLInputElement)
        .value,
    ).toBe("");
    expect(props.onClose).toHaveBeenCalledOnce();
  });
});
