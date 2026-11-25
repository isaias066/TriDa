import { describe, expect, it } from "vitest";
import type { GeoTransaction } from "@/types";
import { buildTransactionFeatureCollection } from "./map-transaction-features";

function createTransaction(
  id: number,
  latitude: number,
  longitude: number,
  color: string | null,
): GeoTransaction {
  return {
    id_transaccion: id,
    monto: 12000,
    tipo_movimiento: "GASTO",
    comercio: `Comercio ${id}`,
    estado: "CONFIRMADA",
    score_anomalia: 4,
    ciudad: "Bogota",
    pais: "Colombia",
    latitud: latitude,
    longitud: longitude,
    fecha_transaccion: "2026-11-21T12:00:00.000Z",
    nombre_cuenta: "Cuenta demo",
    nombre_categoria: "Alimentacion",
    categoria: { nombre: "Alimentacion", color, icono: null },
    es_sospechosa: false,
    nivel_riesgo: "BAJO",
  };
}

describe("buildTransactionFeatureCollection", () => {
  it("uses longitude-latitude order and marks only the selected transaction", () => {
    const data = buildTransactionFeatureCollection(
      [
        createTransaction(1, 4.711, -74.0721, "#22C55E"),
        createTransaction(2, 6.2476, -75.5658, null),
      ],
      2,
    );

    expect(data.features).toEqual([
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-74.0721, 4.711] },
        properties: {
          id_transaccion: 1,
          color: "#22C55E",
          selected: false,
        },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-75.5658, 6.2476] },
        properties: {
          id_transaccion: 2,
          color: "#8B5CF6",
          selected: true,
        },
      },
    ]);
  });
});
