import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReportsPage } from "./ReportsPage";

const mocks = vi.hoisted(() => ({
  useReports: vi.fn(),
}));

vi.mock("@/hooks/useReports", () => ({
  useReports: mocks.useReports,
}));

afterEach(cleanup);

describe("ReportsPage", () => {
  it("renders principal merchants returned by the report", () => {
    mocks.useReports.mockReturnValue({
      reportData: {
        resumen: {
          total_ingresos: 1000,
          total_gastos: 700,
          balance_neto: 300,
          tasa_ahorro: 30,
        },
        gastos_por_categoria: [
          {
            id_categoria: null,
            nombre: "Sin categoría",
            tipo: "GASTO",
            total: 30,
            porcentaje: 4.3,
            numero_transacciones: 1,
            color: null,
          },
        ],
        ingresos_por_categoria: [],
        top_comercios: [
          {
            comercio: "Éxito",
            total: 350,
            numero_transacciones: 2,
            porcentaje: 50,
          },
        ],
        transacciones: [],
        total_transacciones: 1,
        transacciones_truncadas: false,
        periodo: {
          fecha_inicio: "2026-11-01",
          fecha_fin: "2026-11-20",
        },
      },
      loading: false,
      exporting: false,
      filters: { tipo_periodo: "MES_ACTUAL" },
      setPeriodType: vi.fn(),
      setCustomDateRange: vi.fn(),
      exportReport: vi.fn(),
    });

    render(<ReportsPage />);

    expect(
      screen.getByRole("heading", { name: "Comercios principales" }),
    ).toBeTruthy();
    expect(screen.getByText("Éxito")).toBeTruthy();
    expect(screen.getByText("Sin categoría")).toBeTruthy();
    expect(
      screen.getByText("Porcentaje de ingresos destinado al ahorro"),
    ).toBeTruthy();
  });
});
