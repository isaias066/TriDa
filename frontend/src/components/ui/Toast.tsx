// ¿Qué? Sistema de toasts globales (esquina superior derecha) con soporte de alarmas.
// ¿Para qué? Feedback de acciones y pop-ups de alertas de fraude con datos de la alarma.
// ¿Impacto? success/error/info se mantienen; alert() muestra payload de alarma tipado.

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X, ShieldAlert, MapPin, Building2 } from 'lucide-react';
import { RISK_COLORS, RISK_LEVELS, type RiskLevel } from '@constants/Risk';
import { formatCurrency } from '@utils/Formatters';
import { cn } from '@utils/cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'alert';

/** Datos opcionales de una alarma / transacción sospechosa. */
export interface ToastAlarmData {
  level: RiskLevel;
  /** ID de alerta o TX (se muestra como #0001). */
  id?: string | number;
  title?: string;
  description?: string;
  amount?: number | null;
  currency?: string;
  bankName?: string;
  bankColor?: string;
  city?: string;
  clientName?: string;
  score?: number;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  alarm?: ToastAlarmData;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  /** Pop-up de alarma con datos de la transacción/alerta. */
  alert: (alarm: ToastAlarmData, fallbackMessage?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const AUTO_DISMISS_MS = 6000;
const MAX_VISIBLE = 4;

function buildAlarmMessage(alarm: ToastAlarmData): string {
  if (alarm.description?.trim()) return alarm.description;
  if (alarm.title?.trim()) return alarm.title;
  return RISK_LEVELS[alarm.level]?.description ?? 'Nueva alerta detectada';
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { ...item, id }]);
      window.setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
    },
    [removeToast],
  );

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      pushToast({ type, message });
    },
    [pushToast],
  );

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);

  const alert = useCallback(
    (alarm: ToastAlarmData, fallbackMessage?: string) => {
      pushToast({
        type: 'alert',
        message: fallbackMessage ?? buildAlarmMessage(alarm),
        alarm,
      });
    },
    [pushToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, alert }}>
      {children}

      {/* Contenedor: esquina SUPERIOR DERECHA */}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[min(100vw-2rem,360px)] flex-col gap-2 font-sans"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) =>
          toast.type === 'alert' && toast.alarm ? (
            <AlarmToastCard key={toast.id} item={toast} onClose={() => removeToast(toast.id)} />
          ) : (
            <SimpleToastCard key={toast.id} item={toast} onClose={() => removeToast(toast.id)} />
          ),
        )}
      </div>
    </ToastContext.Provider>
  );
}

// ==============================================================================
// Toast simple (success / error / info / warning)
// ==============================================================================

function SimpleToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-xs font-semibold shadow-glow-md animate-slide-up',
        'bg-[var(--bg-secondary)] text-[var(--text-primary)] backdrop-blur-md',
        item.type === 'success' && 'border-[rgba(52,211,153,0.35)] text-neon-green',
        item.type === 'error' && 'border-[rgba(239,68,68,0.35)] text-[var(--color-danger)]',
        item.type === 'warning' && 'border-[rgba(251,191,36,0.35)] text-amber-400',
        item.type === 'info' && 'border-[var(--border-strong)]',
      )}
      role="status"
    >
      <span className="mt-0.5 shrink-0">
        {item.type === 'success' && <CheckCircle2 size={16} />}
        {item.type === 'error' && <AlertCircle size={16} />}
        {(item.type === 'info' || item.type === 'warning') && (
          <Info size={16} className="text-indigo-light" />
        )}
      </span>
      <span className="min-w-0 flex-1 leading-snug text-[var(--text-primary)]">{item.message}</span>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ==============================================================================
// Toast de ALARMA (datos de la alerta / TX)
// ==============================================================================

function AlarmToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const alarm = item.alarm!;
  const level = alarm.level;
  const color = RISK_COLORS[level];
  const levelMeta = RISK_LEVELS[level];
  const alertId = alarm.id != null ? `#${String(alarm.id).padStart(4, '0')}` : null;

  return (
    <div
      className="pointer-events-auto overflow-hidden rounded-xl border bg-[var(--bg-secondary)] shadow-glow-md backdrop-blur-md animate-slide-up"
      style={{
        borderColor: `${color}55`,
        boxShadow: `0 8px 28px rgba(0,0,0,0.25), 0 0 0 1px ${color}22`,
      }}
      role="alert"
    >
      {/* Barra superior de color por criticidad */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="flex gap-3 p-3.5">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}22`, color }}
        >
          <ShieldAlert size={18} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          {/* Cabecera: nivel + id + score */}
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color }}>
              {levelMeta.label}
            </span>
            {alertId && (
              <span className="font-mono text-[10px] font-bold text-[var(--text-tertiary)]">
                {alertId}
              </span>
            )}
            {typeof alarm.score === 'number' && (
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
                style={{ backgroundColor: `${color}18`, color }}
              >
                {Math.round(alarm.score)}%
              </span>
            )}
          </div>

          {/* Título / descripción de la alarma */}
          <p className="m-0 text-xs font-semibold leading-snug text-[var(--text-primary)]">
            {alarm.title ?? item.message}
          </p>
          {alarm.description && alarm.title && (
            <p className="mt-0.5 m-0 text-[11px] leading-snug text-[var(--text-secondary)]">
              {alarm.description}
            </p>
          )}

          {/* Datos de la alarma */}
          <div className="mt-2 flex flex-col gap-1">
            {alarm.clientName && (
              <span className="truncate text-[11px] text-[var(--text-secondary)]">
                {alarm.clientName}
              </span>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              {alarm.amount != null && (
                <span className="font-bold tabular-nums text-[var(--text-primary)]">
                  {formatCurrency(alarm.amount, alarm.currency)}
                </span>
              )}

              {alarm.bankName && (
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Building2 size={11} className="text-[var(--text-tertiary)]" />
                  <span style={{ color: alarm.bankColor || 'var(--text-secondary)' }}>
                    {alarm.bankName}
                  </span>
                </span>
              )}

              {alarm.city && (
                <span className="inline-flex items-center gap-1 text-[var(--text-tertiary)]">
                  <MapPin size={11} />
                  {alarm.city}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 cursor-pointer self-start text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          aria-label="Cerrar alarma"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
}
