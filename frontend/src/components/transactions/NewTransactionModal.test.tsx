import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { NewTransactionModal } from "./NewTransactionModal";

const mocks = vi.hoisted(() => ({
  hasCashAccount: true,
}));

vi.mock("@/hooks/useAccount", () => ({
  useAccount: () => ({
    accounts: mocks.hasCashAccount
      ? [
          {
            id_cuenta: 1,
            nombre: "Cuenta de efectivo",
            tipo: "EFECTIVO",
            estado: true,
          },
        ]
      : [],
    selectedAccount: null,
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  mocks.hasCashAccount = true;
});

describe("NewTransactionModal", () => {
  it("clears validation errors when reopened", async () => {
    const props = {
      onClose: vi.fn(),
      categories: [],
      onSubmit: vi.fn().mockResolvedValue(true),
    };
    const { rerender } = render(<NewTransactionModal {...props} isOpen />);

    fireEvent.change(screen.getByRole("spinbutton", { name: "Monto (COP)" }), {
      target: { value: "25" },
    });
    fireEvent.change(screen.getByLabelText("Cuenta"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Fecha y hora de la transacción"), {
      target: { value: "2999-01-01T10:00" },
    });
    const form = screen
      .getByRole("button", { name: "Guardar Transacción" })
      .closest("form");
    if (!form) throw new Error("No se encontró el formulario de transacción");
    fireEvent.submit(form);

    const validationMessage =
      "La fecha de efectivo no puede estar vacía ni ser futura.";
    expect(await screen.findByText(validationMessage)).toBeTruthy();

    rerender(<NewTransactionModal {...props} isOpen={false} />);
    rerender(<NewTransactionModal {...props} isOpen />);

    await waitFor(() => {
      expect(screen.queryByText(validationMessage)).toBeNull();
    });
  });

  it("offers a route to add a cash account when none exists", () => {
    mocks.hasCashAccount = false;
    render(
      <MemoryRouter>
        <NewTransactionModal
          isOpen
          onClose={vi.fn()}
          categories={[]}
          onSubmit={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: "Agregar una cuenta de efectivo" }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Guardar Transacción" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("submits manual movements from an active cash account", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(
      <MemoryRouter>
        <NewTransactionModal
          isOpen
          onClose={vi.fn()}
          categories={[]}
          onSubmit={onSubmit}
        />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: "Monto (COP)" }), {
      target: { value: "12500" },
    });
    fireEvent.change(screen.getByLabelText("Establecimiento / Comercio"), {
      target: { value: "Mercado local" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar Transacción" }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          id_cuenta: 1,
          monto: 12500,
          tipo_movimiento: "GASTO",
          comercio: "Mercado local",
        }),
      );
    });
  });
});
