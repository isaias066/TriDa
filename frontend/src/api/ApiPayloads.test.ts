import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthApi } from "./Auth";
import { AccountsApi } from "./Accounts";
import { DashboardApi } from "./Dashboard";
import { DevicesApi } from "./Devices";
import { ProfileApi } from "./Profile";
import { reportsApi } from "./Reports";

const clientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("./Client", () => ({
  apiClient: {
    get: clientMocks.get,
    post: clientMocks.post,
    patch: clientMocks.patch,
    delete: clientMocks.delete,
  },
}));

describe("API clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns backend data for message, delete, and status mutations", async () => {
    const message = { message: "Operación completada" };
    clientMocks.post.mockResolvedValue({ data: { data: message } });

    await expect(
      AuthApi.verifyEmail({ token: "verification-token" }),
    ).resolves.toEqual(message);
    await expect(
      AuthApi.changePassword({
        password_actual: "ClaveActual1",
        password_nueva: "ClaveNueva2",
      }),
    ).resolves.toEqual(message);
    await expect(
      AuthApi.forgotPassword({ email: "ana@example.com" }),
    ).resolves.toEqual(message);
    await expect(
      AuthApi.resetPassword({
        token: "reset-token",
        password_nueva: "ClaveNueva2",
      }),
    ).resolves.toEqual(message);
    await expect(
      ProfileApi.changePassword({
        password_actual: "ClaveActual1",
        password_nueva: "ClaveNueva2",
      }),
    ).resolves.toEqual(message);

    clientMocks.delete
      .mockResolvedValueOnce({ data: { data: { id_cuenta: 3 } } })
      .mockResolvedValueOnce({
        data: {
          data: {
            id_dispositivo: 4,
            id_usuario: 7,
            tipo_dispositivo: "MOBILE",
            identificador_unico: "device-4",
            confiable: false,
            fecha_primer_uso: "2026-11-19T10:00:00.000Z",
            fecha_ultimo_uso: "2026-11-19T10:00:00.000Z",
          },
        },
      });

    await expect(AccountsApi.deleteAccount(3)).resolves.toEqual({
      id_cuenta: 3,
    });
    await expect(DevicesApi.delete(4)).resolves.toMatchObject({
      id_dispositivo: 4,
      identificador_unico: "device-4",
    });

    const adviceRead = {
      id_consejo: 9,
      leido: true,
      fecha_leido: "2026-11-19T10:00:00.000Z",
    };
    clientMocks.patch.mockResolvedValue({ data: { data: adviceRead } });
    await expect(DashboardApi.markAdviceRead(9)).resolves.toEqual(adviceRead);
  });

  it("includes uncategorized totals in report percentages", async () => {
    clientMocks.get
      .mockResolvedValueOnce({
        data: {
          data: {
            periodo: {
              fecha_inicio: "2026-11-01T05:00:00.000Z",
              fecha_fin: "2026-11-20T05:00:00.000Z",
            },
            totales: { ingresos: 200, gastos: 100, ahorros: 20, balance: 80 },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            categorias: [
              {
                id_categoria: 3,
                nombre: "Alimentación",
                icono: null,
                color: null,
                total: 70,
                cantidad: 2,
              },
              {
                id_categoria: null,
                nombre: "Sin categoría",
                icono: null,
                color: null,
                total: 30,
                cantidad: 1,
              },
            ],
          },
        },
      })
      .mockResolvedValueOnce({ data: { data: { categorias: [] } } })
      .mockResolvedValueOnce({
        data: {
          data: { items: [], top_comercios: [], total: 0, truncated: false },
        },
      });

    const report = await reportsApi.getFinancialReport({});

    expect(report.gastos_por_categoria).toEqual([
      expect.objectContaining({
        id_categoria: 3,
        nombre: "Alimentación",
        porcentaje: 70,
      }),
      expect.objectContaining({
        id_categoria: null,
        nombre: "Sin categoría",
        porcentaje: 30,
      }),
    ]);
    expect(
      report.gastos_por_categoria.reduce((total, category) => total + category.porcentaje, 0),
    ).toBe(100);
    expect(report.resumen.balance_neto).toBe(80);
    expect(report.resumen.tasa_ahorro).toBe(10);
  });
});
