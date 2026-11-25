import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { createElement, type PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Account } from "@/types/Account";
import { useAccount } from "@/hooks/useAccount";
import { AccountProvider } from "./AccountContext";

const mocks = vi.hoisted(() => ({
  getAccounts: vi.fn(),
}));

vi.mock("@/api/Accounts", () => ({
  AccountsApi: { getAccounts: mocks.getAccounts },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id_usuario: 1 },
  }),
}));

const wrapper = ({ children }: PropsWithChildren) =>
  createElement(AccountProvider, null, children);

afterEach(cleanup);

describe("AccountContext", () => {
  beforeEach(() => {
    mocks.getAccounts.mockReset();
    const store = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      writable: true,
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => { store.set(k, String(v)); },
        removeItem: (k: string) => { store.delete(k); },
        clear: () => { store.clear(); },
      },
    });
  });

  it("selects the first account and clears selection when it disappears", async () => {
    const activeAccount: Account = {
      id_cuenta: 7,
      id_usuario: 1,
      nombre: "Cuenta activa",
      tipo: "BANCO",
      color: "#123456",
      saldo_inicial: 100,
      saldo_actual: 100,
      estado: true,
      fecha_creacion: "2026-01-01T00:00:00.000Z",
    };
    mocks.getAccounts
      .mockResolvedValueOnce([activeAccount])
      .mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAccount(), { wrapper });
    await waitFor(() => {
      expect(result.current.accounts).toEqual([activeAccount]);
    });

    expect(result.current.selectedAccountId).toBe(activeAccount.id_cuenta);

    await act(async () => {
      await result.current.refreshAccounts();
    });

    await waitFor(() => {
      expect(result.current.selectedAccountId).toBeNull();
      expect(result.current.selectedAccount).toBeNull();
    });
  });

  it("restores the user's saved account when it is still active", async () => {
    const accounts: Account[] = [7, 8].map((id) => ({
      id_cuenta: id,
      id_usuario: 1,
      nombre: `Cuenta ${id}`,
      tipo: "BANCO",
      entidad: "Banco",
      numero_enmascarado: "1234",
      color: "#123456",
      saldo_inicial: 100,
      saldo_actual: 100,
      estado: true,
      fecha_creacion: "2026-01-01T00:00:00.000Z",
    }));
    localStorage.setItem("trida:selected-account:1", "8");
    mocks.getAccounts.mockResolvedValue(accounts);

    const { result } = renderHook(() => useAccount(), { wrapper });
    await waitFor(() => {
      expect(result.current.selectedAccountId).toBe(8);
    });

    act(() => {
      result.current.setSelectedAccountId(7);
    });
    expect(localStorage.getItem("trida:selected-account:1")).toBe("7");
  });
});
