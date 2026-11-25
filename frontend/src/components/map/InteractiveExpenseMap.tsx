import { useEffect, useRef, useState } from "react";
import {
  LngLatBounds,
  Map as MapLibreMap,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import mapLibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { AlertTriangle, Building2, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/utils/Formatters";
import { getRiskBadgeClass, getRiskLabel } from "@/utils/Risk";
import type { GeoTransaction } from "@/types";
import { buildTransactionFeatureCollection } from "./map-transaction-features";

setWorkerUrl(mapLibreWorkerUrl);

const TRANSACTION_SOURCE_ID = "transaction-locations";
const TRANSACTION_LAYER_ID = "transaction-points";
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

interface InteractiveExpenseMapProps {
  transactions: GeoTransaction[];
  selectedTransaction: GeoTransaction | null;
  onSelectTransaction: (transaction: GeoTransaction) => void;
}

function createTransactionPopup(transaction: GeoTransaction) {
  const content = document.createElement("div");
  const merchant = document.createElement("strong");
  const details = document.createElement("p");

  content.className = "trida-map-popup-content";
  merchant.className = "trida-map-popup-merchant";
  details.className = "trida-map-popup-details";
  merchant.textContent = transaction.comercio || "Comercio no especificado";
  details.textContent = `${formatCurrency(transaction.monto)} · ${formatDate(transaction.fecha_transaccion)}`;
  content.append(merchant, details);

  return content;
}

export function InteractiveExpenseMap({
  transactions,
  selectedTransaction,
  onSelectTransaction,
}: InteractiveExpenseMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const transactionsRef = useRef(transactions);
  const onSelectTransactionRef = useRef(onSelectTransaction);
  const previousView = useRef({
    transactionIds: "",
    selectedId: null as number | null,
  });
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let hasLoaded = false;
    const map = new MapLibreMap({
      container,
      style: MAP_STYLE_URL,
      center: [-74.0721, 4.711],
      zoom: 5,
      renderWorldCopies: false,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    map.once("style.load", () => {
      hasLoaded = true;
      map.addSource(TRANSACTION_SOURCE_ID, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
      map.addLayer({
        id: TRANSACTION_LAYER_ID,
        type: "circle",
        source: TRANSACTION_SOURCE_ID,
        paint: {
          "circle-radius": ["case", ["==", ["get", "selected"], true], 10, 7],
          "circle-color": [
            "case",
            ["==", ["get", "selected"], true],
            "#EF4444",
            ["get", "color"],
          ],
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-width": 2,
          "circle-opacity": 0.95,
        },
      });
      map.on("click", TRANSACTION_LAYER_ID, (event) => {
        const feature = event.features?.[0];
        const transactionId = Number(feature?.properties?.id_transaccion);
        const transaction = transactionsRef.current.find(
          (item) => item.id_transaccion === transactionId,
        );
        if (!transaction) return;

        onSelectTransactionRef.current(transaction);
        popupRef.current?.remove();
        popupRef.current = new Popup({
          offset: 12,
          className: "trida-map-popup",
        })
          .setLngLat([transaction.longitud, transaction.latitud])
          .setDOMContent(createTransactionPopup(transaction))
          .addTo(map);
      });
      map.on("mouseenter", TRANSACTION_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", TRANSACTION_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });
      setMapError(false);
      setMapReady(true);
    });
    map.on("error", () => {
      if (!hasLoaded) setMapError(true);
    });

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    transactionsRef.current = transactions;
    onSelectTransactionRef.current = onSelectTransaction;
  }, [onSelectTransaction, transactions]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const source = map.getSource(TRANSACTION_SOURCE_ID) as GeoJSONSource;
    const selectedId = selectedTransaction?.id_transaccion ?? null;
    const transactionIds = transactions
      .map((transaction) => transaction.id_transaccion)
      .join(",");

    source.setData(buildTransactionFeatureCollection(transactions, selectedId));

    if (previousView.current.transactionIds !== transactionIds) {
      previousView.current = { transactionIds, selectedId };
      if (transactions.length === 1) {
        const [transaction] = transactions;
        map.flyTo({
          center: [transaction.longitud, transaction.latitud],
          zoom: 13,
          duration: 0,
        });
      } else {
        const bounds = new LngLatBounds();
        transactions.forEach((transaction) => {
          bounds.extend([transaction.longitud, transaction.latitud]);
        });
        map.fitBounds(bounds, { padding: 24, maxZoom: 13, duration: 500 });
      }
      return;
    }

    if (selectedTransaction && previousView.current.selectedId !== selectedId) {
      previousView.current.selectedId = selectedId;
      map.flyTo({
        center: [selectedTransaction.longitud, selectedTransaction.latitud],
        zoom: Math.max(map.getZoom(), 13),
        duration: 400,
      });
    }
  }, [mapReady, selectedTransaction, transactions]);

  if (transactions.length === 0) {
    return (
      <Card className="flex h-[560px] items-center justify-center border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center text-sm text-[var(--color-text-muted)]">
        No hay ubicaciones registradas para mostrar en el mapa.
      </Card>
    );
  }

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden flex flex-col h-[560px]">
      <div className="relative min-h-[300px] flex-1">
        <div
          ref={containerRef}
          role="region"
          aria-label="Mapa interactivo de gastos"
          className="h-full w-full"
        />
        {!mapReady && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-card)] text-sm text-[var(--color-text-muted)]">
            Cargando mapa…
          </div>
        )}
        {mapError && (
          <div
            role="alert"
            className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-card)] p-6 text-center text-sm text-[var(--color-text-muted)]"
          >
            No se pudo cargar el mapa base. Verifica tu conexión e inténtalo de
            nuevo.
          </div>
        )}
      </div>

      <p
        role="note"
        className="border-t border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-muted)]"
      >
        Mapa de OpenFreeMap. Datos ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          OpenStreetMap
        </a>{" "}
        · Estilo ©{" "}
        <a
          href="https://openmaptiles.org/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          OpenMapTiles
        </a>
        .
      </p>

      {selectedTransaction && (
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{
                backgroundColor:
                  selectedTransaction.categoria?.color ||
                  "var(--color-primary)",
              }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                  {selectedTransaction.comercio || "Comercio no especificado"}
                </h3>
                {selectedTransaction.nivel_riesgo && (
                  <span
                    className={`text-2xs px-2 py-0.5 rounded-full font-semibold ${getRiskBadgeClass(
                      selectedTransaction.nivel_riesgo,
                    )}`}
                  >
                    {getRiskLabel(selectedTransaction.nivel_riesgo)}
                  </span>
                )}
                {selectedTransaction.es_sospechosa && (
                  <Badge
                    variant="danger"
                    className="text-2xs flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Sospechosa
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-2 mt-0.5">
                <span>
                  {selectedTransaction.categoria?.nombre || "General"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(selectedTransaction.fecha_transaccion)}
                </span>
              </p>
            </div>
          </div>

          <div className="text-right sm:shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--color-border)]">
            <span className="text-2xs text-[var(--color-text-muted)]">
              Monto registrado
            </span>
            <p className="text-base font-black text-[var(--color-text-primary)]">
              {formatCurrency(selectedTransaction.monto)}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
