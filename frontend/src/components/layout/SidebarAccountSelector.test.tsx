import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SidebarAccountSelector } from "./SidebarAccountSelector";

const mocks = vi.hoisted(() => ({
  setSelectedAccountId: vi.fn(),
}));

vi.mock("@/hooks/useAccount", () => ({
  useAccount: () => ({
    accounts: [
      {
        id_cuenta: 2,
        nombre: "Cuenta de ahorros",
        tipo: "BANCO",
        saldo_actual: 120000,
      },
      {
        id_cuenta: 3,
        nombre: "Cuenta corriente",
        tipo: "BANCO",
        saldo_actual: 50000,
      },
    ],
    selectedAccountId: 2,
    setSelectedAccountId: mocks.setSelectedAccountId,
    totalBalance: 120000,
  }),
}));

afterEach(() => {
  cleanup();
  mocks.setSelectedAccountId.mockReset();
});

describe("SidebarAccountSelector", () => {
  it("announces expanded state and closes with Escape while restoring focus", () => {
    render(<SidebarAccountSelector />);
    const trigger = screen.getByRole("button", {
      name: /Cuenta de ahorros/,
    });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const selectedOption = screen.getByRole("menuitemradio", {
      name: /Cuenta de ahorros/,
    });
    expect(selectedOption.getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(selectedOption);

    fireEvent.keyDown(selectedOption, { key: "ArrowDown" });
    const accountOption = screen.getByRole("menuitemradio", {
      name: /Cuenta corriente/,
    });
    expect(document.activeElement).toBe(accountOption);

    fireEvent.keyDown(accountOption, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });
});
