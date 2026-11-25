import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewAccountModal } from "./NewAccountModal";

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

afterEach(cleanup);

describe("NewAccountModal", () => {
  it("sends only the last four digits of the full account number", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <NewAccountModal
        isOpen
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Nombre de la cuenta"), {
      target: { value: "Ahorros" },
    });
    fireEvent.change(screen.getByLabelText("Entidad Financiera *"), {
      target: { value: "Banco" },
    });
    fireEvent.change(screen.getByLabelText("Número completo de cuenta *"), {
      target: { value: "1234567890123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cuenta" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ numero_enmascarado: "3456" }),
      );
    });
    expect(JSON.stringify(onSubmit.mock.calls[0][0])).not.toContain(
      "1234567890123456",
    );
  });

  it("resets entered values when cancelled", () => {
    const props = { onClose: vi.fn(), onSubmit: vi.fn() };
    const { rerender } = render(<NewAccountModal {...props} isOpen />);

    fireEvent.change(screen.getByLabelText("Nombre de la cuenta"), {
      target: { value: "Cuenta temporal" },
    });
    fireEvent.change(screen.getByLabelText("Entidad Financiera *"), {
      target: { value: "Banco temporal" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    rerender(<NewAccountModal {...props} isOpen={false} />);
    rerender(<NewAccountModal {...props} isOpen />);

    expect(
      (screen.getByLabelText("Nombre de la cuenta") as HTMLInputElement).value,
    ).toBe("");
    expect(
      (screen.getByLabelText("Entidad Financiera *") as HTMLInputElement)
        .value,
    ).toBe("");
    expect(
      (screen.getByLabelText("Tipo de cuenta") as HTMLSelectElement).value,
    ).toBe("BANCO");
    expect(
      (screen.getByLabelText("Saldo Inicial (COP)") as HTMLInputElement).value,
    ).toBe("0");
    expect(
      (screen.getByLabelText("Número completo de cuenta *") as HTMLInputElement)
        .value,
    ).toBe("");
    expect(
      (screen.getByLabelText("Color distintivo") as HTMLInputElement).value,
    ).toBe("#8b5cf6");
    expect(props.onClose).toHaveBeenCalledOnce();
  });
});
