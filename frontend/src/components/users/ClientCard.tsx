// ¿Qué? Card expandible de un cliente bancario y sus dispositivos.
// ¿Para qué? Lista de clientes en UsersPage con riesgo, contacto y dispositivos.
// ¿Impacto? Colores de riesgo desde Risk.ts; layout flexible al tema; self-start en grid.

import { useState } from 'react';
import { ChevronRight, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { UserAvatar } from '@components/shared/UserAvatar';
import { RiskBadge } from '@components/shared/RiskBadge';
import { BankBadge } from '@components/shared/BankBadge';
import { StatusBadge } from '@components/shared/StatusBadge';
import { RISK_COLORS, getRiskLevel, riskColorAlpha, type RiskLevel } from '@constants/Risk';
import { formatDate } from '@utils/Formatters';
import { cn } from '@utils/cn';
import { DeviceCard } from './DeviceCard';
import type { BankClient, Device } from '@app-types';

export interface ClientCardProps {
  client: BankClient;
  devices?: Device[];
  defaultExpanded?: boolean;
  onClick?: (client: BankClient) => void;
  className?: string;
}

function resolveClientRiskLevel(score: number, explicit?: RiskLevel): RiskLevel {
  if (explicit) return explicit;
  return getRiskLevel(Number(score) || 0);
}

export function ClientCard({
  client,
  devices = [],
  defaultExpanded = false,
  onClick,
  className = '',
}: ClientCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const score = Math.min(100, Math.max(0, Number(client.riskScore) || 0));
  const level = resolveClientRiskLevel(score);
  const riskColor = RISK_COLORS[level];
  const isActive = client.status === 'active';

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

  return (
    <div
      className={cn(
        'client-card self-start overflow-hidden rounded-xl border border-[var(--border)]',
        'bg-[var(--bg-secondary)] font-sans transition-[border-color,opacity] duration-150',
        !isActive && 'opacity-60',
        className,
      )}
      data-status={client.status}
      data-risk-level={level}
    >
      {/* Header */}
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
          <span
            className="truncate text-[13px] font-bold text-[var(--text-primary)]"
            title={client.name}
          >
            {client.name}
          </span>
          <BankBadge bank={client.bank} size="sm" />
        </div>

        <span
          className={cn(
            'h-2 w-2 shrink-0 rounded-full',
            isActive ? 'bg-neon-green shadow-neon-green' : 'bg-[var(--text-disabled)]',
          )}
          title={isActive ? 'Activo' : 'Inactivo'}
          aria-hidden="true"
        />

        <ChevronRight
          size={16}
          className={cn(
            'shrink-0 text-[var(--text-tertiary)] transition-transform duration-200',
            expanded && 'rotate-90',
          )}
          aria-hidden="true"
        />
      </div>

      {/* Contenido expandido */}
      {expanded && (
        <div className="flex flex-col gap-3 border-t border-[var(--border)] px-4 pb-4 pt-3">
          {/* Riesgo — colores canónicos */}
          <div className="flex flex-col gap-2 rounded-lg bg-[var(--bg-tertiary)] px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
                Riesgo
              </span>
              <RiskBadge score={score} size="sm" />
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]"
              role="progressbar"
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Score de riesgo ${score}`}
            >
              <div
                className="h-full rounded-full transition-[width] duration-300 ease-out"
                style={{
                  width: `${score}%`,
                  background: `linear-gradient(90deg, ${riskColorAlpha(level, 0.75)} 0%, ${riskColor} 100%)`,
                  boxShadow: score > 0 ? `0 0 8px ${riskColorAlpha(level, 0.4)}` : 'none',
                }}
              />
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-[var(--text-tertiary)]">Estado</span>
            <StatusBadge type="user" status={client.status} size="sm" />
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-2">
            <InfoRow
              icon={<Mail size={12} className="shrink-0 opacity-70" aria-hidden="true" />}
              label="Email"
              value={client.email}
              title={client.email}
            />
            <InfoRow
              icon={<Phone size={12} className="shrink-0 opacity-70" aria-hidden="true" />}
              label="Teléfono"
              value={client.phone}
              mono
            />
          </div>

          {/* Ubicación */}
          <InfoRow
            icon={<MapPin size={12} className="shrink-0 opacity-70" aria-hidden="true" />}
            label="Ubicación"
            value={[client.city, client.country].filter(Boolean).join(', ') || '—'}
          />

          {/* Registro */}
          <InfoRow
            icon={<Calendar size={12} className="shrink-0 opacity-70" aria-hidden="true" />}
            label="Registrado"
            value={client.registeredAt ? formatDate(client.registeredAt) : '—'}
          />

          {/* Dispositivos */}
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

function InfoRow({
  icon,
  label,
  value,
  title,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  title?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-tertiary)]">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          'max-w-[200px] truncate text-right text-xs font-semibold text-[var(--text-primary)]',
          mono && 'tabular-nums',
        )}
        title={title ?? value}
      >
        {value || '—'}
      </span>
    </div>
  );
}
