import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SecurityHistory } from "./SecurityHistory";

const mocks = vi.hoisted(() => ({
  getMyHistory: vi.fn(),
}));

vi.mock("@/api/Audit", () => ({
  AuditApi: { getMyHistory: mocks.getMyHistory },
}));

afterEach(cleanup);

describe("SecurityHistory", () => {
  beforeEach(() => {
    mocks.getMyHistory.mockReset();
  });

  it("loads only read-only security events and paginates with a cursor", async () => {
    mocks.getMyHistory
      .mockResolvedValueOnce({
        items: [
          {
            id_log: 12,
            tipo_accion: "INICIO_SESION_EXITOSO",
            entidad_afectada: "usuarios",
            id_entidad: 1,
            descripcion: "Inicio de sesión exitoso.",
            fecha_accion: "2026-11-19T15:00:00.000Z",
          },
        ],
        has_more: true,
        next_cursor: 12,
      })
      .mockResolvedValueOnce({
        items: [
          {
            id_log: 11,
            tipo_accion: "INICIO_SESION_FALLIDO",
            entidad_afectada: "usuarios",
            id_entidad: 1,
            descripcion: "Se rechazaron las credenciales.",
            fecha_accion: "2026-11-19T14:00:00.000Z",
          },
        ],
        has_more: false,
        next_cursor: null,
      });

    render(<SecurityHistory />);

    expect(await screen.findByText("Inicio de sesión")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /editar|eliminar/i }),
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Ver eventos anteriores" }),
    );

    expect(
      await screen.findByText("Intento de inicio de sesión rechazado"),
    ).toBeTruthy();
    await waitFor(() => {
      expect(mocks.getMyHistory).toHaveBeenNthCalledWith(2, {
        limit: 20,
        before_id: 12,
      });
    });
  });
});
