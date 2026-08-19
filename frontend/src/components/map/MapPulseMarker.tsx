// ¿Qué? Marcador animado (pulse) que aparece brevemente sobre transacciones nuevas.
// ¿Para qué? Reemplazar el componente Pulse inline de transactionmap.jsx que usaba
//            L.divIcon para crear animaciones de "ondas" en el mapa.
// ¿Impacto? Se usa en TransactionMapPage para dar feedback visual de actividad
//           en tiempo real cuando llegan transacciones nuevas.

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { RISK_COLORS, type RiskLevel } from '@constants/Risk';
import type { MapPulse } from '@hooks/useMapData';

// ==============================================================================
// TYPES
// ==============================================================================

export interface MapPulseMarkerProps {
  pulse: MapPulse;
}

// ==============================================================================
// HELPERS
// ==============================================================================

/**
 * Determina el tamaño del pulse según el nivel de riesgo.
 */
function getPulseSize(level: RiskLevel): number {
  switch (level) {
    case 'critical': return 24;
    case 'high':     return 18;
    case 'medium':   return 14;
    default:         return 10;
  }
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function MapPulseMarker({ pulse }: MapPulseMarkerProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  const color = RISK_COLORS[pulse.level] ?? '#6366F1';
  const size = getPulseSize(pulse.level);

  useEffect(() => {
    if (!map) return;

    // Crear ícono personalizado con animación CSS
    const icon = L.divIcon({
      className: 'map-pulse-marker',
      html: `
        <div style="
          position: relative;
          width: ${size * 2}px;
          height: ${size * 2}px;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: ${color};
            opacity: 0.8;
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 2px solid ${color};
            animation: map-pulse-expand 1.5s ease-out infinite;
          "></div>
        </div>
      `,
      iconSize: [size * 2, size * 2],
      iconAnchor: [size, size],
    });

    // Crear y añadir el marcador al mapa
    const marker = L.marker(
      [pulse.latitude, pulse.longitude],
      { icon, interactive: false }
    ).addTo(map);

    markerRef.current = marker;

    // Auto-remover después de 3.5 segundos (duración de la animación)
    const timeout = setTimeout(() => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
    }, 3500);

    // Cleanup al desmontar
    return () => {
      clearTimeout(timeout);
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
    };
  }, [map, pulse.latitude, pulse.longitude, color, size]);

  // Este componente no renderiza nada en React — trabaja directamente con Leaflet
  return null;
}