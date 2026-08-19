// ¿Qué? Diálogo modal de confirmación reutilizable con variantes (info, warning, danger).
// ¿Para qué? Reemplazar los window.confirm() nativos que no son estilizables
//            ni accesibles, y los diálogos inline en Sidebar y Settings.
// ¿Impacto? Todas las confirmaciones del sistema usan este componente,
//           garantizando UX consistente y accesibilidad completa.

import type { ReactNode } from 'react';
import { AlertTriangle, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import type { ButtonVariant } from '@components/ui/Button';

// ==============================================================================
// TYPES
// ==============================================================================

export type ConfirmDialogVariant = 'info' | 'warning' | 'danger' | 'question';

export interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

// ==============================================================================
// CONFIGURACIÓN POR VARIANTE
// ==============================================================================

interface VariantConfig {
  icon:           ReactNode;
  iconColor:      string;
  iconBackground: string;
  confirmVariant: ButtonVariant;
}

const VARIANT_CONFIG: Record<ConfirmDialogVariant, VariantConfig> = {
  info: {
    icon:           <Info size={24} strokeWidth={2} />,
    iconColor:      '#06B6D4',
    iconBackground: 'rgba(6, 182, 212, 0.15)',
    confirmVariant: 'primary',
  },
  warning: {
    icon:           <AlertTriangle size={24} strokeWidth={2} />,
    iconColor:      '#FBBF24',
    iconBackground: 'rgba(251, 191, 36, 0.15)',
    confirmVariant: 'primary',
  },
  danger: {
    icon:           <AlertCircle size={24} strokeWidth={2} />,
    iconColor:      '#EF4444',
    iconBackground: 'rgba(239, 68, 68, 0.15)',
    confirmVariant: 'danger',
  },
  question: {
    icon:           <HelpCircle size={24} strokeWidth={2} />,
    iconColor:      '#6366F1',
    iconBackground: 'rgba(99, 102, 241, 0.15)',
    confirmVariant: 'primary',
  },
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'question',
  loading = false,
  disabled = false,
  icon,
  children,
}: ConfirmDialogProps) {
  const config = VARIANT_CONFIG[variant];

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const contentStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           '16px',
    padding:       '8px 0',
  };

  const iconWrapperStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '56px',
    height:         '56px',
    borderRadius:   '50%',
    background:     config.iconBackground,
    color:          config.iconColor,
    flexShrink:     0,
  };

  const messageStyle: React.CSSProperties = {
    fontSize:   '13px',
    color:      'var(--text-secondary)',
    lineHeight: 1.5,
    textAlign:  'center',
    margin:     0,
    maxWidth:   '400px',
  };

  const extraContentStyle: React.CSSProperties = {
    width: '100%',
    marginTop: '4px',
  };

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleConfirm = async (): Promise<void> => {
    try {
      await onConfirm();
    } catch (err) {
      console.error('ConfirmDialog: error en onConfirm', err);
    }
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      showCloseButton={false}
      disableClose={loading}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            loading={loading}
            disabled={disabled}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={contentStyle}>
        <div
          style={iconWrapperStyle}
          role="img"
          aria-label={`Ícono de ${variant}`}
        >
          {icon ?? config.icon}
        </div>

        <div style={{ textAlign: 'center', width: '100%' }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 8px',
              lineHeight: 1.3,
            }}
          >
            {title}
          </h3>

          <div style={messageStyle}>
            {typeof message === 'string' ? <p style={{ margin: 0 }}>{message}</p> : message}
          </div>
        </div>

        {children && <div style={extraContentStyle}>{children}</div>}
      </div>
    </Modal>
  );
}