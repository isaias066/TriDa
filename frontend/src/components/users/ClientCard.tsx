// ¿Qué? Card expandible que muestra info de un cliente bancario y sus dispositivos.
// ¿Para qué? Reemplazar las cards inline de users.jsx con una versión tipada,
//            reutilizable y con expansión/colapso integrado.
// ¿Impacto? Se usa en UsersPage para renderizar la lista de clientes bancarios.

import { useState } from 'react';
import { ChevronRight, Mail, Phone, MapPin, Calendar } from 'lucide-react';
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
// HELPERS
// ==============================================================================

function getRiskBarColor(score: number): string {
  if (score >= 80) return '#FF6B6B';
  if (score >= 60) return '#FF8A4C';
  if (score >= 30) return '#FFB547';
  return '#06D6A0';
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
    setExpanded((prev) => !prev);
    onClick?.(client);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`client-card self-start overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] font-sans transition-[border-color] duration-150 ${
        client.status === 'inactive' ? 'client-card-inactive opacity-60' : ''
      } ${className}`}
    >
      {/* ================================================================
          HEADER — siempre visible
          ================================================================ */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${client.name} — ${client.bank.name}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="flex cursor-pointer select-none items-center gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-[var(--bg-tertiary)]"
      >
        <UserAvatar name={client.name} color={client.bank.color} size="sm" />

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[13px] font-bold text-[var(--text-primary)]" title={client.name}>
            {client.name}
          </span>
          <BankBadge bank={client.bank} size="sm" />
        </div>

        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            client.status === 'active' ? 'bg-neon-green shadow-neon-green' : 'bg-[var(--text-disabled)]'
          }`}
          title={client.status === 'active' ? 'Activo' : 'Inactivo'}
        />

        <ChevronRight
          size={16}
          className={`shrink-0 text-[var(--text-tertiary)] transition-transform duration-200 ${
            expanded ? 'rotate-90' : ''
          }`}
        />
      </div>

      {/* ================================================================
          CONTENIDO EXPANDIDO — orden por importancia
          ================================================================ */}
      {expanded && (
        <div className="flex flex-col gap-3 border-t border-[var(--border)] px-4 pb-4 pt-3">
          {/* 1. Riesgo (máxima prioridad en antifraude) */}
          <div className="flex flex-col gap-2 rounded-lg bg-[var(--bg-tertiary)] px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
                Riesgo
              </span>
              <RiskBadge score={client.riskScore} size="sm" />
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]">
              <div
                className="h-full rounded-full transition-[width] duration-300 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(0, client.riskScore))}%`,
                  background: getRiskBarColor(client.riskScore),
                  boxShadow: `0 0 8px ${getRiskBarColor(client.riskScore)}66`,
                }}
              />
            </div>
          </div>

          {/* 2. Estado */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-[var(--text-tertiary)]">Estado</span>
            <StatusBadge type="user" status={client.status} size="sm" />
          </div>

          {/* 3. Contacto */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-tertiary)]">
                <Mail size={12} className="shrink-0 opacity-70" aria-hidden="true" />
                Email
              </span>
              <span
                className="max-w-[200px] truncate text-right text-xs font-semibold text-[var(--text-primary)]"
                title={client.email}
              >
                {client.email}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-tertiary)]">
                <Phone size={12} className="shrink-0 opacity-70" aria-hidden="true" />
                Teléfono
              </span>
              <span className="text-right text-xs font-semibold tabular-nums text-[var(--text-primary)]">
                {client.phone}
              </span>
            </div>
          </div>

          {/* 4. Ubicación (ciudad + país compactos) */}
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-tertiary)]">
              <MapPin size={12} className="shrink-0 opacity-70" aria-hidden="true" />
              Ubicación
            </span>
            <span className="max-w-[200px] truncate text-right text-xs font-semibold text-[var(--text-primary)]">
              {client.city}, {client.country}
            </span>
          </div>

          {/* 5. Fecha de registro */}
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-tertiary)]">
              <Calendar size={12} className="shrink-0 opacity-70" aria-hidden="true" />
              Registrado
            </span>
            <span className="text-right text-xs font-semibold text-[var(--text-primary)]">
              {formatDate(client.registeredAt)}
            </span>
          </div>

          {/* 6. Dispositivos */}
          <div className="flex flex-col gap-1.5 border-t border-[var(--border)] pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-tertiary)]">
              Dispositivos ({devices.length})
            </span>

            {devices.length === 0 ? (
              <span className="text-[11px] italic text-[var(--text-tertiary)]">
                Sin dispositivos registrados
              </span>
            ) : (
              devices.map((device) => <DeviceCard key={device.id} device={device} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}