// ¿Qué? Página del mapa geográfico de transacciones en tiempo real.
// ¿Para qué? Mapa interactivo mundial con tiles sin API key, pulsos y stats.
// ¿Impacto? Muestra de forma inteligente si la data en el mapa está acotada.

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';

import { useBank } from '@context/BankContext';
import { useTheme } from '@context/ThemeContext';
import { useMapData } from '@hooks/useMapData';

import { Button, EmptyState, Skeleton } from '@components/ui';
import { MapPointMarker, MapPulseMarker, MapStatsOverlay } from '@components/map';
import { RISK_COLORS, RISK_LEVELS, type RiskLevel } from '@constants/Risk';
import { ShieldAlert } from 'lucide-react'; // Icono para el badge de truncado

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const TILE_URLS = {
  dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  light:
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
} as const;

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 2;
const LEGEND_LEVELS: RiskLevel[] = ['low', 'medium', 'high', 'critical'];

export function TransactionMapPage() {
  const { selectedBank } = useBank();
  const { theme } = useTheme();

  useEffect(() => {
    document.title = 'Mapa en Vivo — TriDa';
  }, []);

  const {
    stats,
    points,
    activePulses,
    criticalPoints,
    loading,
    error,
    lastUpdated,
    refetch,
    refreshing,
    totalPoints,
    truncated,
  } = useMapData(selectedBank, {
    autoRefresh: true,
    autoRefreshMs: 10_000,
    enablePulses: true,
    maxPoints: 500, // Soporta renderizado de hasta 500 puntos concurrentes
  });

  const [showOnlyCritical, setShowOnlyCritical] = useState(false);

  const tileUrl = TILE_URLS[theme] ?? TILE_URLS.dark;
  const visiblePoints = showOnlyCritical ? criticalPoints : points;

  const recentPointIds = useMemo(() => {
    const ids = new Set<string>();
    points.slice(0, 5).forEach((p) => ids.add(p.id));
    return ids;
  }, [points]);

  if (error && points.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-10 font-sans">
        <EmptyState
          preset="error"
          description={error}
          action={
            <Button variant="primary" onClick={refetch}>
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  if (loading && points.length === 0) {
    return (
      <div className="flex h-screen flex-col font-sans">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="relative flex-1 p-4">
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden font-sans">
      <header className="z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="m-0 text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
            Mapa Global
          </h1>
          <div className="flex items-center gap-2">
            <p className="m-0 text-xs text-[var(--text-secondary)]">
              En tiempo real · {visiblePoints.length.toLocaleString('es-CO')} mostrados
            </p>
            {truncated && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/20 animate-pulse">
                <ShieldAlert className="h-3 w-3 text-amber-500" />
                Filtrados {points.length} de {totalPoints.toLocaleString('es-CO')} puntos
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-2 flex items-center gap-3">
            {LEGEND_LEVELS.map((level) => (
              <div
                key={level}
                className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: RISK_COLORS[level],
                    boxShadow: `0 0 8px ${RISK_COLORS[level]}60`,
                  }}
                />
                <span>{RISK_LEVELS[level].label}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowOnlyCritical(!showOnlyCritical)}
            aria-pressed={showOnlyCritical}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 font-sans text-[11px] font-semibold transition-all duration-150 ${
              showOnlyCritical
                ? 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-[var(--color-danger)]'
                : 'border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
            }`}
          >
            Solo críticos
          </button>

          {lastUpdated && (
            <span className="ml-2 text-[10px] italic text-[var(--text-tertiary)]">
              Actualizado: {lastUpdated.toLocaleTimeString('es-CO')}
            </span>
          )}
        </div>
      </header>

      <div className="relative flex-1">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          attributionControl={false}
          minZoom={2}
          maxZoom={18}
          dragging={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          boxZoom={true}
          keyboard={true}
          touchZoom={true}
        >
          <TileLayer url={tileUrl} />

          {visiblePoints.map((point) => (
            <MapPointMarker key={point.id} point={point} isRecent={recentPointIds.has(point.id)} />
          ))}

          {activePulses.map((pulse) => (
            <MapPulseMarker key={pulse.id} pulse={pulse} />
          ))}
        </MapContainer>

        {stats && <MapStatsOverlay stats={stats} position="bottom-left" />}

        {refreshing && (
          <div className="pointer-events-none absolute right-3 top-3 z-[1000] rounded-md border border-[rgba(99,102,241,0.2)] bg-[rgba(10,10,15,0.8)] px-2.5 py-1 text-[10px] font-semibold text-indigo-light backdrop-blur-md">
            Actualizando...
          </div>
        )}
      </div>
    </div>
  );
}
