import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthApi } from "@/api/Auth";
import { VerifyEmailPage } from "./VerifyEmailPage";

vi.mock("@/api/Auth", () => ({
  AuthApi: {
    verifyEmail: vi.fn(),
  },
}));

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: vi.fn() }),
}));

const verifyEmail = vi.mocked(AuthApi.verifyEmail);

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/verify-email#token=test-token");
    verifyEmail.mockResolvedValue({ message: "Correo verificado." });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("centers the verification confirmation header, message, notice, and action", async () => {
    render(
      <MemoryRouter>
        <VerifyEmailPage />
      </MemoryRouter>,
    );

    await screen.findByRole("heading", { name: "Correo confirmado" });
    await waitFor(() => {
      expect(
        screen.getByText(
          "Tu correo ha sido verificado. Ya puedes iniciar sesión.",
        ),
      ).toBeTruthy();
    });

    expect(
      screen.getByRole("heading", { name: "Verificación de correo" })
        .parentElement?.className,
    ).toContain("text-center");
    expect(screen.getByRole("status").className).toContain("text-center");
    expect(
      screen.getByText("Tu cuenta ya está lista para iniciar sesión.")
        .parentElement?.className,
    ).toContain("text-center");
    expect(
      screen.getByRole("link", { name: "Ir al inicio de sesión" }).className,
    ).toContain("text-center");
  });
});
