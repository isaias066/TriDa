// ¿Qué? Página del mapa geográfico de transacciones en tiempo real.
// ¿Para qué? Reemplazar transactionmap.jsx con una versión modular que usa
//            useMapData hook y componentes específicos de Leaflet.
// ¿Impacto? Se accede en /map. Muestra todas las transacciones sobre un mapa
//           mundial con marcadores coloreados por nivel de riesgo y animaciones
//           de pulse para transacciones nuevas.

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBank } from '@context/BankContext';
import { useTheme } from '@context/ThemeContext';
import { useMapData } from '@hooks/useMapData';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import { Button } from '@components/ui/Button';
import {
  MapPointMarker,
  MapPulseMarker,
  MapStatsOverlay,
} from '@components/map';
import { RISK_COLORS, RISK_LEVELS, type RiskLevel } from '@constants/Risk';

// ==============================================================================
// FIX — Leaflet default icon paths (bug conocido con bundlers)
// ==============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',    import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',  import.meta.url).href,
});

// ==============================================================================
// CONSTANTES
// ==============================================================================

/** URLs de tiles según el tema. */
const TILE_URLS = {
  dark:  'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
} as const;

/** Centro inicial del mapa (vista global). */
const DEFAULT_CENTER: [number, number] = [10, -50];
const DEFAULT_ZOOM = 3;

/** Niveles de riesgo para la leyenda. */
const LEGEND_LEVELS: RiskLevel[] = ['low', 'medium', 'high', 'critical'];

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function TransactionMapPage() {
  const { selectedBank } = useBank();
  const { theme } = useTheme();

  // ==============================================================================
  // METADATA
  // ==============================================================================

  useEffect(() => {
    document.title = 'Mapa en Vivo — TriDa';
  }, []);

  // ==============================================================================
  // DATOS — useMapData con auto-refresh y pulses
  // ==============================================================================

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
  } = useMapData(selectedBank, {
    autoRefresh:  true,
    autoRefreshMs: 10_000,
    enablePulses: true,
    maxPoints:    150,
  });

  // ==============================================================================
  // ESTADO LOCAL
  // ==============================================================================

  const [showOnlyCritical, setShowOnlyCritical] = useState(false);

  // ==============================================================================
  // VALORES DERIVADOS
  // ==============================================================================

  const tileUrl = TILE_URLS[theme] ?? TILE_URLS.dark;
  const visiblePoints = showOnlyCritical ? criticalPoints : points;

  // IDs de los puntos recientes (para resaltar en el mapa)
  const recentPointIds = useMemo(() => {
    const ids = new Set<string>();
    points.slice(0, 5).forEach(p => ids.add(p.id));
    return ids;
  }, [points]);

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const pageStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    height:        '100vh',
    fontFamily:    'Inter, sans-serif',
    position:      'relative',
    overflow:      'hidden',
  };

  const headerStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            '12px',
    padding:        '16px 20px',
    background:     'var(--bg-secondary)',
    borderBottom:   '1px solid var(--border)',
    zIndex:         10,
    flexShrink:     0,
    flexWrap:       'wrap',
  };

  const headerLeftStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize:      '18px',
    fontWeight:    800,
    color:         'var(--text-primary)',
    margin:        0,
    letterSpacing: '-0.02em',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '12px',
    color:    'var(--text-secondary)',
    margin:   0,
  };

  const headerRightStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '8px',
    flexWrap:   'wrap',
  };

  const legendStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '12px',
  };

  const legendItemStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '4px',
    fontSize:   '11px',
    color:      'var(--text-secondary)',
  };

  const legendDotStyle = (color: string): React.CSSProperties => ({
    width:        '10px',
    height:       '10px',
    borderRadius: '50%',
    background:   color,
    boxShadow:    `0 0 8px ${color}60`,
    flexShrink:   0,
  });

  const mapContainerStyle: React.CSSProperties = {
    flex:     1,
    position: 'relative',
  };

  const lastUpdatedStyle: React.CSSProperties = {
    fontSize:  '10px',
    color:     'var(--text-tertiary)',
    fontStyle: 'italic',
  };

  const criticalToggleStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'center',
    gap:          '6px',
    padding:      '6px 12px',
    fontSize:     '11px',
    fontWeight:   600,
    color:        showOnlyCritical ? '#EF4444' : 'var(--text-secondary)',
    background:   showOnlyCritical ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
    border:       `1px solid ${showOnlyCritical ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}`,
    borderRadius: '8px',
    cursor:       'pointer',
    transition:   'all 0.15s ease',
    fontFamily:   'inherit',
  };

  const refreshIndicatorStyle: React.CSSProperties = {
    position:       'absolute',
    top:            '12px',
    right:          '12px',
    zIndex:         1000,
    fontSize:       '10px',
    fontWeight:     600,
    color:          '#818CF8',
    padding:        '4px 10px',
    background:     'rgba(10, 10, 15, 0.8)',
    backdropFilter: 'blur(8px)',
    borderRadius:   '6px',
    border:         '1px solid rgba(99, 102, 241, 0.2)',
    pointerEvents:  'none',
    animation:      'map-refresh-fade 1s ease-out forwards',
  };

  // ==============================================================================
  // RENDER — LOADING
  // ==============================================================================

  if (loading && points.length === 0) {
    return (
      <div style={{ ...pageStyle, alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" label="Cargando mapa..." centered />
      </div>
    );
  }

  // ==============================================================================
  // RENDER — ERROR
  // ==============================================================================

  if (error && points.length === 0) {
    return (
      <div style={{ ...pageStyle, alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
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

  // ==============================================================================
  // RENDER — PÁGINA
  // ==============================================================================

  return (
    <div style={pageStyle}>

      {/* ================================================================
          HEADER
          ================================================================ */}

      <header style={headerStyle}>
        <div style={headerLeftStyle}>
          <h1 style={titleStyle}>Mapa Global</h1>
          <p style={subtitleStyle}>
            Transacciones en tiempo real · {visiblePoints.length.toLocaleString('es-CO')} puntos
          </p>
        </div>

        <div style={headerRightStyle}>
          {/* Leyenda de colores */}
          <div style={legendStyle}>
            {LEGEND_LEVELS.map(level => (
              <div key={level} style={legendItemStyle}>
                <span style={legendDotStyle(RISK_COLORS[level])} />
                <span>{RISK_LEVELS[level].label}</span>
              </div>
            ))}
          </div>

          {/* Toggle solo críticos */}
          <button
            type="button"
            style={criticalToggleStyle}
            onClick={() => setShowOnlyCritical(!showOnlyCritical)}
            aria-pressed={showOnlyCritical}
            aria-label={showOnlyCritical ? 'Mostrar todos los puntos' : 'Solo puntos críticos'}
          >
            {showOnlyCritical ? '🔴 Solo críticos' : 'Solo críticos'}
          </button>

          {/* Última actualización */}
          {lastUpdated && (
            <span style={lastUpdatedStyle}>
              Actualizado: {lastUpdated.toLocaleTimeString('es-CO')}
            </span>
          )}
        </div>
      </header>

      {/* ================================================================
          MAPA
          ================================================================ */}

      <div style={mapContainerStyle}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
          minZoom={2}
          maxZoom={18}
        >
          {/* Capa de tiles (cambia según tema dark/light) */}
          <TileLayer url={tileUrl} />

          {/* Marcadores de transacciones */}
          {visiblePoints.map(point => (
            <MapPointMarker
              key={point.id}
              point={point}
              isRecent={recentPointIds.has(point.id)}
            />
          ))}

          {/* Pulses animados (transacciones nuevas) */}
          {activePulses.map(pulse => (
            <MapPulseMarker key={pulse.id} pulse={pulse} />
          ))}
        </MapContainer>

        {/* Contadores flotantes */}
        {stats && (
          <MapStatsOverlay stats={stats} position="bottom-left" />
        )}

        {/* Indicador de refresh */}
        {refreshing && (
          <div style={refreshIndicatorStyle}>
            Actualizando...
          </div>
        )}
      </div>

      {/* Animación del indicador de refresh */}
      <style>{`
        @keyframes map-refresh-fade {
          0%   { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}