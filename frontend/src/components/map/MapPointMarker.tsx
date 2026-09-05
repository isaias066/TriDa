// ¿Qué? Marcador circular en el mapa para representar una transacción.
// ¿Para qué? CircleMarker + popup + anillo de pulso en alertas altas/críticas.
// ¿Impacto? Se usa en TransactionMapPage para cada punto del mapa.

import { useEffect } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { RISK_COLORS, type RiskLevel } from '@constants/Risk';
import { MapPointPopup } from './MapPointPopup';
import type { TransactionMapPoint } from '@app-types';

export interface MapPointMarkerProps {
  point: TransactionMapPoint;
  isRecent?: boolean;
  onClick?: (point: TransactionMapPoint) => void;
}

function getMarkerRadius(level: RiskLevel, isRecent: boolean): number {
  const base = { critical: 9, high: 7, medium: 5, low: 4 } as const;
  return isRecent ? base[level] + 2 : base[level];
}

function ensurePulseKeyframes() {
  const styleId = 'trida-marker-pulse-keyframes';
  if (document.getElementById(styleId)) return;

  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.innerHTML = `
    @keyframes trida-marker-pulse {
      0%   { stroke-opacity: 0.9; stroke-width: 2; }
      70%  { stroke-opacity: 0.15; stroke-width: 10; }
      100% { stroke-opacity: 0; stroke-width: 14; }
    }
    .trida-pulse-ring {
      animation: trida-marker-pulse 1.8s ease-out infinite;
    }
  `;
  document.head.appendChild(styleEl);
}

export function MapPointMarker({ point, isRecent = false, onClick }: MapPointMarkerProps) {
  const level = point.alertLevel as RiskLevel;
  const color = RISK_COLORS[level] ?? '#6366F1';
  const radius = getMarkerRadius(level, isRecent);
  const shouldPulse = level === 'critical' || level === 'high' || isRecent;

  useEffect(() => {
    ensurePulseKeyframes();
  }, []);

  return (
    <>
      {/* Anillo de pulso detrás del punto (solo alertas / recientes) */}
      {shouldPulse && (
        <CircleMarker
          center={[point.location.latitude, point.location.longitude]}
          radius={radius + 4}
          pathOptions={{
            color,
            fillColor: 'transparent',
            fillOpacity: 0,
            weight: 2,
            opacity: 0.7,
            className: 'trida-pulse-ring',
          }}
          interactive={false}
        />
      )}

      <CircleMarker
        center={[point.location.latitude, point.location.longitude]}
        radius={radius}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: isRecent || level === 'critical' ? 0.95 : 0.65,
          weight: isRecent ? 2.5 : 1.5,
          opacity: 1,
        }}
        eventHandlers={{
          click: () => onClick?.(point),
        }}
      >
        <Popup
          className="trida-map-popup"
          closeButton={true}
          // Evita que Leaflet inyecte ancho raro
          minWidth={260}
          maxWidth={300}
        >
          <MapPointPopup point={point} />
        </Popup>
      </CircleMarker>
    </>
  );
}
