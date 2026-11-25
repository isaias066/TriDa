import type { GeoTransaction } from "@/types";

export function buildTransactionFeatureCollection(
  transactions: GeoTransaction[],
  selectedId: number | null,
) {
  return {
    type: "FeatureCollection",
    features: transactions.map((transaction) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [transaction.longitud, transaction.latitud],
      },
      properties: {
        id_transaccion: transaction.id_transaccion,
        color: transaction.categoria?.color || "#8B5CF6",
        selected: transaction.id_transaccion === selectedId,
      },
    })),
  };
}
