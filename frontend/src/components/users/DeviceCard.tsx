// ¿Qué? Card compacta de un dispositivo registrado.
// ¿Para qué? Mostrar tipo, OS, navegador y banco dentro de ClientCard o vista dispositivos.
// ¿Impacto? Tailwind + tokens de tema; iconos Lucide en lugar de emojis.

import { Smartphone, Monitor, Tablet, Watch, HelpCircle, type LucideIcon } from 'lucide-react';
import { getDeviceCategoryLabel } from '@utils/Device';
import { formatDate } from '@utils/Formatters';
import { cn } from '@utils/cn';
import type { Device } from '@app-types';

export interface DeviceCardProps {
  device: Device;
  detailed?: boolean;
  className?: string;
}

/** Resuelve ícono Lucide según tipo/categoría (flexible, sin emojis). */
function resolveDeviceIcon(type?: string, category?: string): LucideIcon {
  const raw = `${type ?? ''} ${category ?? ''}`.toLowerCase();
  if (raw.includes('tablet') || raw.includes('ipad')) return Tablet;
  if (raw.includes('watch') || raw.includes('wear')) return Watch;
  if (
    raw.includes('desktop') ||
    raw.includes('pc') ||
    raw.includes('laptop') ||
    raw.includes('mac') ||
    raw.includes('windows')
  ) {
    return Monitor;
  }
  if (
    raw.includes('mobile') ||
    raw.includes('phone') ||
    raw.includes('android') ||
    raw.includes('ios')
  ) {
    return Smartphone;
  }
  return HelpCircle;
}

export function DeviceCard({ device, detailed = false, className = '' }: DeviceCardProps) {
  const Icon = resolveDeviceIcon(device.type, device.category);
  const categoryLabel = getDeviceCategoryLabel(device.category);
  const bankName = device.bank?.name;
  const showBank =
    Boolean(bankName) && bankName !== 'Sin banco' && bankName !== 'Sin banco asignado';

  return (
    <div
      className={cn(
        'device-card flex items-start gap-2.5 font-sans',
        detailed
          ? 'rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3'
          : 'rounded-lg bg-[var(--bg-tertiary)] px-2.5 py-2',
        className,
      )}
    >
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
        aria-hidden="true"
      >
        <Icon size={16} strokeWidth={1.75} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className="truncate text-xs font-semibold text-[var(--text-primary)]"
          title={device.type}
        >
          {device.type || 'Dispositivo'}
        </span>

        <span className="flex flex-wrap items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
          <span>{device.operatingSystem || '—'}</span>
          {detailed && device.browser && device.browser !== 'N/D' && (
            <>
              <span aria-hidden="true">·</span>
              <span>{device.browser}</span>
            </>
          )}
        </span>

        {detailed && (
          <>
            <span className="flex flex-wrap items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
              <span>{categoryLabel}</span>
              {device.lastUsedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Último uso: {formatDate(device.lastUsedAt)}</span>
                </>
              )}
            </span>

            {showBank && (
              <span
                className="text-[10px] font-semibold"
                style={{ color: device.bank.color || 'var(--text-secondary)' }}
              >
                {bankName}
              </span>
            )}

            {device.clientName && (
              <span className="truncate text-[10px] text-[var(--text-secondary)]">
                {device.clientName}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
