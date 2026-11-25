import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MapSummaryCards } from "./MapSummaryCards";

afterEach(cleanup);

describe("MapSummaryCards", () => {
  it("shows only metrics supported by stored coordinates and risk data", () => {
    render(
      <MapSummaryCards
        summary={{
          total_geolocalizadas: 12,
          ciudades_distintas: 3,
          paises_distintos: 2,
          transacciones_riesgo_alto: 4,
          score_promedio: 82.5,
        }}
      />,
    );

    expect(screen.getByText("Ubicaciones registradas")).toBeTruthy();
    expect(screen.getByText("Riesgo alto")).toBeTruthy();
    expect(screen.queryByText("Ciudades")).toBeNull();
    expect(screen.queryByText("Países registrados")).toBeNull();
    expect(screen.queryByText("Puntos registrados")).toBeNull();
  });
});
