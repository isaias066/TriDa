// ¿Qué? Marcador animado temporal sobre transacciones nuevas.
// ¿Para qué? Onda expansiva CSS inyectada al DOM para feedback en vivo.
// ¿Impacto? Se monta desde TransactionMapPage con activePulses.

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { RISK_COLORS, type RiskLevel } from '@constants/Risk';
import type { MapPulse } from '@hooks/useMapData';

export interface MapPulseMarkerProps {
  pulse: MapPulse;
}

function getPulseSize(level: RiskLevel): number {
  switch (level) {
    case 'critical':
      return 28;
    case 'high':
      return 22;
    case 'medium':
      return 16;
    default:
      return 12;
  }
}

export function MapPulseMarker({ pulse }: MapPulseMarkerProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  const color = RISK_COLORS[pulse.level] ?? '#6366F1';
  const size = getPulseSize(pulse.level);

  useEffect(() => {
    if (!map) return;

    const styleId = 'trida-map-pulse-keyframes';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        @keyframes trida-pulse-expand {
          0%   { transform: translate(-50%, -50%) scale(0.55); opacity: 0.95; }
          100% { transform: translate(-50%, -50%) scale(2.6);  opacity: 0; }
        }
      `;
      document.head.appendChild(styleEl);
    }

    const icon = L.divIcon({
      className: 'map-pulse-marker',
      html: `
        <div style="position:relative;width:${size * 2.8}px;height:${size * 2.8}px;">
          <div style="
            position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
            width:${size}px;height:${size}px;border-radius:50%;
            background:${color};box-shadow:0 0 12px ${color};opacity:0.95;z-index:2;
          "></div>
          <div style="
            position:absolute;top:50%;left:50%;
            width:${size * 1.4}px;height:${size * 1.4}px;border-radius:50%;
            border:2px solid ${color};
            animation:trida-pulse-expand 1.6s cubic-bezier(0.22,1,0.36,1) infinite;
            z-index:1;
          "></div>
          <div style="
            position:absolute;top:50%;left:50%;
            width:${size * 1.4}px;height:${size * 1.4}px;border-radius:50%;
            border:2px solid ${color};
            animation:trida-pulse-expand 1.6s cubic-bezier(0.22,1,0.36,1) infinite 0.35s;
            z-index:1;
          "></div>
        </div>
      `,
      iconSize: [size * 2.8, size * 2.8],
      iconAnchor: [size * 1.4, size * 1.4],
    });

    const marker = L.marker([pulse.latitude, pulse.longitude], {
      icon,
      interactive: false,
      keyboard: false,
    }).addTo(map);

    markerRef.current = marker;

    const timeout = setTimeout(() => {
      if (markerRef.current) map.removeLayer(markerRef.current);
    }, 4000);

    return () => {
      clearTimeout(timeout);
      if (markerRef.current) map.removeLayer(markerRef.current);
    };
  }, [map, pulse.latitude, pulse.longitude, color, size]);

  return null;
}
