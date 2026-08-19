// ¿Qué? Botón con menú desplegable para exportar datos en múltiples formatos.
// ¿Para qué? Reemplazar los menús de exportación duplicados en Alerts y
//            Transactions con implementaciones idénticas de dropdown.
// ¿Impacto? Todos los botones de exportación del sistema usan este componente,
//           garantizando consistencia visual y comportamiento uniforme.

import { useRef, useState } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Eye,
  ChevronDown,
  FileJson,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import type { ButtonSize, ButtonVariant } from '@components/ui/Button';
import { useClickOutside } from '@hooks/useClickOutside';
import type { ExportFormat } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

export interface ExportOption {
  format: ExportFormat;
  label: string;
  icon?: React.ReactNode;
  hasPreview?: boolean;
  disabled?: boolean;
}

export interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  onPreview?: (format: ExportFormat) => void;
  options?: ExportOption[];
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  showChevron?: boolean;
  align?: 'left' | 'right';
  className?: string;
}

// ==============================================================================
// OPCIONES POR DEFECTO
// ==============================================================================

const DEFAULT_OPTIONS: ExportOption[] = [
  {
    format:     'csv',
    label:      'Exportar CSV',
    icon:       <FileSpreadsheet size={13} />,
    hasPreview: true,
  },
  {
    format:     'pdf',
    label:      'Exportar PDF',
    icon:       <FileText size={13} />,
    hasPreview: true,
  },
  {
    format:     'json',
    label:      'Exportar JSON',
    icon:       <FileJson size={13} />,
    hasPreview: false,
  },
];

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ExportButton({
  onExport,
  onPreview,
  options = DEFAULT_OPTIONS,
  label = 'Exportar',
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  showChevron = true,
  align = 'right',
  className = '',
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useClickOutside<HTMLDivElement>(
    () => setOpen(false),
    { enabled: open, additionalRefs: [triggerRef] }
  );

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleExport = (format: ExportFormat): void => {
    onExport(format);
    setOpen(false);
  };

  const handlePreview = (format: ExportFormat): void => {
    if (!onPreview) return;
    onPreview(format);
    setOpen(false);
  };

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display:  'inline-block',
  };

  const menuStyle: React.CSSProperties = {
    position:      'absolute',
    top:           'calc(100% + 4px)',
    right:         align === 'right' ? 0 : 'auto',
    left:          align === 'left'  ? 0 : 'auto',
    minWidth:      '200px',
    background:    'var(--bg-secondary)',
    border:        '1px solid var(--border)',
    borderRadius:  '8px',
    boxShadow:     '0 8px 24px rgba(0, 0, 0, 0.3)',
    zIndex:        100,
    padding:       '6px',
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
    fontFamily:    'Inter, sans-serif',
    animation:     'export-menu-in 0.15s ease-out',
  };

  const optionBaseStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    gap:            '8px',
    width:          '100%',
    padding:        '8px 10px',
    fontSize:       '12px',
    fontWeight:     500,
    fontFamily:     'Inter, sans-serif',
    color:          'var(--text-primary)',
    background:     'transparent',
    border:         'none',
    borderRadius:   '6px',
    cursor:         'pointer',
    textAlign:      'left',
    transition:     'background 0.15s ease',
  };

  const optionDisabledStyle: React.CSSProperties = {
    ...optionBaseStyle,
    opacity: 0.5,
    cursor:  'not-allowed',
  };

  const iconWrapperStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    color:      'var(--text-secondary)',
    flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    flex: 1,
  };

  const previewIconStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    color:      'var(--text-tertiary)',
    flexShrink: 0,
  };

  const dividerStyle: React.CSSProperties = {
    height:     '1px',
    background: 'var(--border)',
    margin:     '4px 0',
    border:     'none',
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize:       '10px',
    fontWeight:     700,
    color:          'var(--text-tertiary)',
    textTransform:  'uppercase',
    letterSpacing:  '0.05em',
    padding:        '6px 10px 4px',
    userSelect:     'none',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  const hasPreviewOptions = options.some((opt) => opt.hasPreview && onPreview);

  return (
    <div ref={triggerRef} className={`export-button ${className}`} style={wrapperStyle}>
      <Button
        variant={variant}
        size={size}
        loading={loading}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        leftIcon={<Download size={14} />}
        rightIcon={showChevron ? <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} /> : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menú de exportación"
      >
        {label}
      </Button>

      {open && (
        <div
          ref={menuRef as React.RefObject<HTMLDivElement>}
          style={menuStyle}
          role="menu"
          aria-label="Opciones de exportación"
        >
          {/* Opciones con preview */}
          {hasPreviewOptions && (
            <>
              <div style={sectionLabelStyle}>Vista previa</div>
              {options
                .filter((opt) => opt.hasPreview && onPreview)
                .map((opt) => (
                  <button
                    key={`preview-${opt.format}`}
                    type="button"
                    onClick={() => handlePreview(opt.format)}
                    disabled={opt.disabled}
                    style={opt.disabled ? optionDisabledStyle : optionBaseStyle}
                    role="menuitem"
                    onMouseEnter={(e) => {
                      if (!opt.disabled) {
                        (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!opt.disabled) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={iconWrapperStyle}>{opt.icon}</span>
                    <span style={labelStyle}>Ver {opt.format.toUpperCase()}</span>
                    <span style={previewIconStyle}>
                      <Eye size={11} />
                    </span>
                  </button>
                ))}

              <hr style={dividerStyle} />
            </>
          )}

          {/* Opciones de descarga directa */}
          <div style={sectionLabelStyle}>Descargar</div>
          {options.map((opt) => (
            <button
              key={`export-${opt.format}`}
              type="button"
              onClick={() => handleExport(opt.format)}
              disabled={opt.disabled}
              style={opt.disabled ? optionDisabledStyle : optionBaseStyle}
              role="menuitem"
              onMouseEnter={(e) => {
                if (!opt.disabled) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!opt.disabled) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <span style={iconWrapperStyle}>{opt.icon}</span>
              <span style={labelStyle}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes export-menu-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}