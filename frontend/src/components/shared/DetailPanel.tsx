// ¿Qué? Panel lateral deslizante para mostrar detalles de un item (alerta, transacción, etc.).
// ¿Para qué? Reemplazar los múltiples paneles de detalle inline que estaban en Alerts
//            y Transactions con implementaciones ligeramente distintas.
// ¿Impacto? Todos los paneles de detalle del sistema usan este componente,
//           garantizando consistencia visual y accesibilidad.

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

// ==============================================================================
// TYPES
// ==============================================================================

export type DetailPanelSize = 'sm' | 'md' | 'lg' | 'xl';

export type DetailPanelPosition = 'right' | 'left';

export interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: DetailPanelSize;
  position?: DetailPanelPosition;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export interface DetailFieldProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
  valueStyle?: React.CSSProperties;
  className?: string;
}

export interface DetailGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

// ==============================================================================
// ANCHOS POR TAMAÑO
// ==============================================================================

const SIZE_WIDTHS: Record<DetailPanelSize, string> = {
  sm: '320px',
  md: '400px',
  lg: '520px',
  xl: '640px',
};

// ==============================================================================
// COMPONENTE PRINCIPAL — DetailPanel
// ==============================================================================

export function DetailPanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  position = 'right',
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}: DetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // ==============================================================================
  // CIERRE CON TECLA ESCAPE
  // ==============================================================================

  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  // ==============================================================================
  // FOCUS AL ABRIR
  // ==============================================================================

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        panelRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const panelStyle: React.CSSProperties = {
    position:      'sticky',
    top:           0,
    right:         position === 'right' ? 0 : 'auto',
    left:          position === 'left' ? 0 : 'auto',
    height:        '100%',
    minHeight:     '400px',
    maxHeight:     '100vh',
    width:         open ? SIZE_WIDTHS[size] : '0px',
    background:    'var(--bg-secondary)',
    borderLeft:    position === 'right' ? '1px solid var(--border)' : 'none',
    borderRight:   position === 'left' ? '1px solid var(--border)' : 'none',
    overflow:      'hidden',
    transition:    'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    display:       'flex',
    flexDirection: 'column',
    fontFamily:    'Inter, sans-serif',
    flexShrink:    0,
  };

  const innerStyle: React.CSSProperties = {
    width:         SIZE_WIDTHS[size],
    height:        '100%',
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
  };

  const headerStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    gap:            '16px',
    padding:        '20px 20px 16px',
    borderBottom:   '1px solid var(--border)',
    flexShrink:     0,
  };

  const titleGroupStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '4px',
    flex:          1,
    minWidth:      0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize:   '15px',
    fontWeight: 700,
    color:      'var(--text-primary)',
    margin:     0,
    lineHeight: 1.3,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize:   '12px',
    color:      'var(--text-tertiary)',
    margin:     0,
    lineHeight: 1.4,
    wordBreak:  'break-all',
  };

  const closeButtonStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '28px',
    height:         '28px',
    background:     'transparent',
    border:         'none',
    borderRadius:   '6px',
    color:          'var(--text-tertiary)',
    cursor:         'pointer',
    transition:     'background 0.15s ease, color 0.15s ease',
    flexShrink:     0,
  };

  const bodyStyle: React.CSSProperties = {
    padding:   '20px',
    overflowY: 'auto',
    flex:      1,
    fontSize:  '13px',
    color:     'var(--text-primary)',
  };

  const footerStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'flex-end',
    gap:            '8px',
    padding:        '12px 20px 16px',
    borderTop:      '1px solid var(--border)',
    flexShrink:     0,
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <aside
      ref={panelRef}
      className={`detail-panel detail-panel-${position} detail-panel-${size} ${open ? 'detail-panel-open' : 'detail-panel-closed'} ${className}`}
      style={panelStyle}
      role="complementary"
      aria-hidden={!open}
      aria-label={typeof title === 'string' ? title : 'Panel de detalle'}
      tabIndex={-1}
    >
      <div style={innerStyle}>
        {/* HEADER */}
        <div style={headerStyle}>
          <div style={titleGroupStyle}>
            <h3 style={titleStyle}>{title}</h3>
            {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              style={closeButtonStyle}
              aria-label="Cerrar panel de detalle"
              title="Cerrar (Esc)"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* BODY */}
        <div style={bodyStyle}>{children}</div>

        {/* FOOTER */}
        {footer && <div style={footerStyle}>{footer}</div>}
      </div>
    </aside>
  );
}

// ==============================================================================
// SUB-COMPONENTE — DetailField
// ==============================================================================


export function DetailField({
  label,
  value,
  icon,
  fullWidth = false,
  valueStyle,
  className = '',
}: DetailFieldProps) {
  const wrapperStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '4px',
    gridColumn:    fullWidth ? '1 / -1' : 'auto',
    minWidth:      0,
  };

  const labelStyle: React.CSSProperties = {
    fontSize:       '10px',
    fontWeight:     600,
    color:          'var(--text-tertiary)',
    textTransform:  'uppercase',
    letterSpacing:  '0.05em',
    display:        'flex',
    alignItems:     'center',
    gap:            '4px',
  };

  const valueBaseStyle: React.CSSProperties = {
    fontSize:   '13px',
    fontWeight: 600,
    color:      'var(--text-primary)',
    wordBreak:  'break-word',
    ...valueStyle,
  };

  return (
    <div className={`detail-field ${className}`} style={wrapperStyle}>
      <span style={labelStyle}>
        {icon}
        {label}
      </span>
      <span style={valueBaseStyle}>{value}</span>
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — DetailGrid
// ==============================================================================

export function DetailGrid({
  children,
  columns = 2,
  className = '',
}: DetailGridProps) {
  const gridStyle: React.CSSProperties = {
    display:              'grid',
    gridTemplateColumns:  `repeat(${columns}, minmax(0, 1fr))`,
    gap:                  '16px',
  };

  return (
    <div className={`detail-grid detail-grid-${columns}col ${className}`} style={gridStyle}>
      {children}
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — DetailDivider
// ==============================================================================

export function DetailDivider({ className = '' }: { className?: string }) {
  const style: React.CSSProperties = {
    height:     '1px',
    background: 'var(--border)',
    margin:     '16px 0',
    border:     'none',
  };

  return <hr className={`detail-divider ${className}`} style={style} />;
}

// ==============================================================================
// SUB-COMPONENTE — DetailSection
// ==============================================================================

export interface DetailSectionProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DetailSection({ title, children, className = '' }: DetailSectionProps) {
  const wrapperStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize:      '11px',
    fontWeight:    700,
    color:         'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom:  '12px',
  };

  return (
    <div className={`detail-section ${className}`} style={wrapperStyle}>
      <h4 style={titleStyle}>{title}</h4>
      {children}
    </div>
  );
}