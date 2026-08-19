// ¿Qué? Card expandible que muestra info de un cliente bancario y sus dispositivos.
// ¿Para qué? Reemplazar las cards inline de users.jsx con una versión tipada,
//            reutilizable y con expansión/colapso integrado.
// ¿Impacto? Se usa en UsersPage para renderizar la lista de clientes bancarios.

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { UserAvatar } from '@components/shared/UserAvatar';
import { RiskBadge } from '@components/shared/RiskBadge';
import { BankBadge } from '@components/shared/BankBadge';
import { StatusBadge } from '@components/shared/StatusBadge';
import { formatDate } from '@utils/Formatters';
import { DeviceCard } from './DeviceCard';
import type { BankClient, Device } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

export interface ClientCardProps {
  client: BankClient;
  devices?: Device[];
  defaultExpanded?: boolean;
  onClick?: (client: BankClient) => void;
  className?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ClientCard({
  client,
  devices = [],
  defaultExpanded = false,
  onClick,
  className = '',
}: ClientCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleToggle = (): void => {
    setExpanded(prev => !prev);
    onClick?.(client);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const cardStyle: React.CSSProperties = {
    background:    'var(--bg-secondary)',
    border:        '1px solid var(--border)',
    borderRadius:  '12px',
    overflow:      'hidden',
    transition:    'border-color 0.15s ease',
    opacity:       client.status === 'inactive' ? 0.6 : 1,
    fontFamily:    'Inter, sans-serif',
  };

  const headerStyle: React.CSSProperties = {
    display:     'flex',
    alignItems:  'center',
    gap:         '12px',
    padding:     '14px 16px',
    cursor:      'pointer',
    transition:  'background 0.15s ease',
    userSelect:  'none',
  };

  const infoStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
    flex:          1,
    minWidth:      0,
  };

  const nameStyle: React.CSSProperties = {
    fontSize:     '13px',
    fontWeight:   700,
    color:        'var(--text-primary)',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  };

  const statusDotStyle: React.CSSProperties = {
    width:        '8px',
    height:       '8px',
    borderRadius: '50%',
    background:   client.status === 'active' ? '#34D399' : '#6B7280',
    flexShrink:   0,
  };

  const chevronStyle: React.CSSProperties = {
    color:      'var(--text-tertiary)',
    transition: 'transform 0.2s ease',
    transform:  expanded ? 'rotate(90deg)' : 'none',
    flexShrink: 0,
  };

  const expandedStyle: React.CSSProperties = {
    padding:     '0 16px 16px',
    display:     'flex',
    flexDirection: 'column',
    gap:         '12px',
    borderTop:   '1px solid var(--border)',
    paddingTop:  '12px',
  };

  const detailRowStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    gap:            '8px',
  };

  const detailLabelStyle: React.CSSProperties = {
    fontSize:   '11px',
    color:      'var(--text-tertiary)',
    fontWeight: 500,
  };

  const detailValueStyle: React.CSSProperties = {
    fontSize:     '12px',
    fontWeight:   600,
    color:        'var(--text-primary)',
    textAlign:    'right',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
    maxWidth:     '200px',
  };

  const devicesSectionStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '6px',
  };

  const devicesTitleStyle: React.CSSProperties = {
    fontSize:      '10px',
    fontWeight:    700,
    color:         'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const riskBarStyle: React.CSSProperties = {
    width:        '100%',
    height:       '4px',
    background:   'var(--bg-tertiary)',
    borderRadius: '2px',
    overflow:     'hidden',
    marginTop:    '4px',
  };

  const riskFillStyle: React.CSSProperties = {
    height:       '100%',
    width:        `${client.riskScore}%`,
    borderRadius: '2px',
    transition:   'width 0.3s ease',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`client-card ${client.status === 'inactive' ? 'client-card-inactive' : ''} ${className}`}
      style={cardStyle}
    >
      {/* Header (siempre visible) */}
      <div
        style={headerStyle}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${client.name} — ${client.bank.name}`}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }}
      >
        <UserAvatar
          name={client.name}
          color={client.bank.color}
          size="sm"
        />

        <div style={infoStyle}>
          <span style={nameStyle} title={client.name}>{client.name}</span>
          <BankBadge bank={client.bank} size="sm" />
        </div>

        <span style={statusDotStyle} title={client.status === 'active' ? 'Activo' : 'Inactivo'} />

        <ChevronRight size={16} style={chevronStyle} />
      </div>

      {/* Contenido expandido */}
      {expanded && (
        <div style={expandedStyle}>
          {/* Detalles del cliente */}
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Email</span>
            <span style={detailValueStyle} title={client.email}>{client.email}</span>
          </div>

          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Teléfono</span>
            <span style={detailValueStyle}>{client.phone}</span>
          </div>

          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Ciudad</span>
            <span style={detailValueStyle}>{client.city}</span>
          </div>

          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>País</span>
            <span style={detailValueStyle}>{client.country}</span>
          </div>

          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Riesgo</span>
            <RiskBadge score={client.riskScore} size="sm" />
          </div>

          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Registrado</span>
            <span style={detailValueStyle}>{formatDate(client.registeredAt)}</span>
          </div>

          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Estado</span>
            <StatusBadge type="user" status={client.status} size="sm" />
          </div>

          {/* Barra de riesgo */}
          <div style={riskBarStyle}>
            <div
              style={{
                ...riskFillStyle,
                background: client.riskScore >= 80 ? '#EF4444'
                           : client.riskScore >= 60 ? '#F97316'
                           : client.riskScore >= 30 ? '#FBBF24'
                           : '#34D399',
              }}
            />
          </div>

          {/* Dispositivos */}
          <div style={devicesSectionStyle}>
            <span style={devicesTitleStyle}>
              Dispositivos ({devices.length})
            </span>

            {devices.length === 0 ? (
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                Sin dispositivos registrados
              </span>
            ) : (
              devices.map(device => (
                <DeviceCard key={device.id} device={device} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}