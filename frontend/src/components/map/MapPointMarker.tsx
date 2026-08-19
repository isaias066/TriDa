// ¿Qué? Marcador circular en el mapa para representar una transacción.
// ¿Para qué? Encapsular la lógica de CircleMarker + Popup de react-leaflet
//            con colores según nivel de riesgo.
// ¿Impacto? Se usa en TransactionMapPage para renderizar cada punto.

import { CircleMarker, Popup } from 'react-leaflet';
import { RISK_COLORS, type RiskLevel } from '@constants/Risk';
import { MapPointPopup } from './MapPointPopup';
import type { TransactionMapPoint } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

export interface MapPointMarkerProps {
  point: TransactionMapPoint;
  isRecent?: boolean;
  onClick?: (point: TransactionMapPoint) => void;
}

// ==============================================================================
// HELPERS
// ==============================================================================

function getMarkerRadius(level: RiskLevel, isRecent: boolean): number {
  const base = {
    critical: 8,
    high:     6,
    medium:   4,
    low:      3,
  };
  return isRecent ? base[level] + 2 : base[level];
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function MapPointMarker({
  point,
  isRecent = false,
  onClick,
}: MapPointMarkerProps) {
  const level = point.alertLevel as RiskLevel;
  const color = RISK_COLORS[level] ?? '#6366F1';
  const radius = getMarkerRadius(level, isRecent);

  return (
    <CircleMarker
      center={[point.location.latitude, point.location.longitude]}
      radius={radius}
      pathOptions={{
        color,
        fillColor:   color,
        fillOpacity: isRecent ? 0.9 : 0.5,
        weight:      isRecent ? 2.5 : 1,
        opacity:     isRecent ? 1 : 0.6,
      }}
      eventHandlers={{
        click: () => onClick?.(point),
      }}
    >
      <Popup>
        <MapPointPopup point={point} />
      </Popup>
    </CircleMarker>
  );
}