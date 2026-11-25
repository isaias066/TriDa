import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const mocks = vi.hoisted(() => ({
  accountCount: 0,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id_usuario: 1, rol: "USER" },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock("@/hooks/useAccount", () => ({
  useAccount: () => ({
    accounts: Array.from({ length: mocks.accountCount }, (_, index) => ({
      id_cuenta: index + 1,
    })),
    isLoading: false,
    loadError: null,
    refreshAccounts: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  mocks.accountCount = 0;
});

describe("ProtectedRoute", () => {
  it("requires the first account before opening other protected pages", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <span>Dashboard privado</span>
              </ProtectedRoute>
            }
          />
          <Route path="/accounts" element={<span>Crear cuenta</span>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Crear cuenta")).toBeTruthy();
    expect(screen.queryByText("Dashboard privado")).toBeNull();
  });
});
