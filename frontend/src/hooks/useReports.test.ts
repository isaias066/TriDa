import { describe, expect, it } from "vitest";
import { getReportDateRange } from "./useReports";

describe("getReportDateRange", () => {
  const instant = new Date("2026-03-01T04:30:00.000Z");

  it("uses Bogota calendar boundaries for current, rolling, and year periods", () => {
    expect(getReportDateRange({ tipo_periodo: "MES_ACTUAL" }, instant)).toEqual(
      {
        fecha_inicio: "2026-02-01",
        fecha_fin: "2026-02-28",
      },
    );
    expect(
      getReportDateRange({ tipo_periodo: "ULTIMOS_3_MESES" }, instant),
    ).toEqual({
      fecha_inicio: "2025-12-01",
      fecha_fin: "2026-02-28",
    });
    expect(
      getReportDateRange({ tipo_periodo: "ANIO_ACTUAL" }, instant),
    ).toEqual({
      fecha_inicio: "2026-01-01",
      fecha_fin: "2026-02-28",
    });
  });

  it("rejects invalid custom ranges and preserves valid dates", () => {
    expect(
      getReportDateRange(
        {
          tipo_periodo: "PERSONALIZADO",
          fecha_inicio: "2026-03-02",
          fecha_fin: "2026-03-01",
        },
        instant,
      ),
    ).toBeNull();
    expect(
      getReportDateRange(
        {
          tipo_periodo: "PERSONALIZADO",
          fecha_inicio: "2026-02-01",
          fecha_fin: "2026-02-28",
        },
        instant,
      ),
    ).toEqual({ fecha_inicio: "2026-02-01", fecha_fin: "2026-02-28" });
  });
});
