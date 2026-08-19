// ¿Qué? Card compacta que muestra información de un dispositivo registrado.
// ¿Para qué? Reemplazar el markup inline de dispositivos que estaba dentro de
//            la card del cliente en users.jsx.
// ¿Impacto? Se usa dentro de ClientCard para mostrar los dispositivos de cada
//           cliente bancario.

import { getDeviceEmoji, getDeviceCategoryLabel } from '@utils/Device';
import { formatDate } from '@utils/Formatters';
import type { Device } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

/** Props del DeviceCard. */
export interface DeviceCardProps {
  device: Device;
  detailed?: boolean;
  className?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function DeviceCard({
  device,
  detailed = false,
  className = '',
}: DeviceCardProps) {
  const emoji = getDeviceEmoji(device.type);
  const categoryLabel = getDeviceCategoryLabel(device.category);

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const cardStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'flex-start',
    gap:          '10px',
    padding:      detailed ? '12px' : '8px 10px',
    background:   detailed ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
    border:       detailed ? '1px solid var(--border)' : 'none',
    borderRadius: '8px',
    fontFamily:   'Inter, sans-serif',
  };

  const emojiStyle: React.CSSProperties = {
    fontSize:   '18px',
    flexShrink: 0,
    lineHeight: 1,
    marginTop:  '1px',
  };

  const infoStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
    flex:          1,
    minWidth:      0,
  };

  const typeStyle: React.CSSProperties = {
    fontSize:     '12px',
    fontWeight:   600,
    color:        'var(--text-primary)',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  };

  const detailStyle: React.CSSProperties = {
    fontSize: '10px',
    color:    'var(--text-tertiary)',
    display:  'flex',
    alignItems: 'center',
    gap:      '4px',
  };

  const bankStyle: React.CSSProperties = {
    fontSize:   '10px',
    fontWeight: 600,
    color:      device.bank.color,
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div className={`device-card ${className}`} style={cardStyle}>
      {/* Emoji del dispositivo */}
      <span style={emojiStyle} role="img" aria-label={categoryLabel}>
        {emoji}
      </span>

      {/* Info del dispositivo */}
      <div style={infoStyle}>
        <span style={typeStyle} title={device.type}>
          {device.type}
        </span>

        <span style={detailStyle}>
          {device.operatingSystem}
          {detailed && device.browser && device.browser !== 'N/D' && (
            <> · {device.browser}</>
          )}
        </span>

        {detailed && (
          <>
            <span style={detailStyle}>
              {categoryLabel}
              {device.lastUsedAt && (
                <> · Último uso: {formatDate(device.lastUsedAt)}</>
              )}
            </span>

            {device.bank.name && device.bank.name !== 'Sin banco' && (
              <span style={bankStyle}>{device.bank.name}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}