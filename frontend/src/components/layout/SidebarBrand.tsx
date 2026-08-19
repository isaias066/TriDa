// ¿Qué? Cabecera del sidebar con logo, nombre del sistema y botón de colapsar.
// ¿Para qué? Aislar la parte superior del sidebar (brand + toggle) del componente
//            principal Sidebar.tsx para mejor mantenibilidad.
// ¿Impacto? Solo se usa dentro del Sidebar. Reemplaza el bloque `sb-brand` inline
//           del sidebar.jsx original.

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Tooltip } from '@components/ui/Tooltip';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SidebarBrandProps {
  collapsed: boolean;
  onToggle: () => void;
  logoSrc?: string;
  brandName?: string;
  tagline?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function SidebarBrand({
  collapsed,
  onToggle,
  logoSrc = '/logo.png',
  brandName = 'TriDa',
  tagline = 'Fraud Detection AI',
}: SidebarBrandProps) {

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: collapsed ? 'center' : 'space-between',
    gap:            '10px',
    padding:        collapsed ? '16px 12px' : '16px',
    borderBottom:   '1px solid var(--border)',
    fontFamily:     'Inter, sans-serif',
    minHeight:      '68px',
    position:       'relative',
  };

  const brandInfoStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '10px',
    flex:       1,
    minWidth:   0,
  };

  const logoBaseStyle: React.CSSProperties = {
    borderRadius: '8px',
    flexShrink:   0,
    objectFit:    'contain',
  };

  const logoExpandedStyle: React.CSSProperties = {
    ...logoBaseStyle,
    width:  '32px',
    height: '32px',
  };

  const logoCollapsedStyle: React.CSSProperties = {
    ...logoBaseStyle,
    width:  '28px',
    height: '28px',
  };

  const brandTextStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
    minWidth:      0,
  };

  const brandNameStyle: React.CSSProperties = {
    fontSize:   '15px',
    fontWeight: 800,
    color:      'var(--text-primary)',
    lineHeight: 1,
    letterSpacing: '-0.01em',
  };

  const taglineStyle: React.CSSProperties = {
    fontSize:   '10px',
    color:      'var(--text-tertiary)',
    fontWeight: 500,
    lineHeight: 1,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const toggleButtonStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '28px',
    height:         '28px',
    background:     'transparent',
    border:         '1px solid var(--border)',
    borderRadius:   '6px',
    color:          'var(--text-tertiary)',
    cursor:         'pointer',
    transition:     'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
    flexShrink:     0,
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className="sidebar-brand"
      style={wrapperStyle}
    >
      {/* Modo expandido: logo + texto */}
      {!collapsed && (
        <div style={brandInfoStyle}>
          <img
            src={logoSrc}
            alt={brandName}
            style={logoExpandedStyle}
            onError={(e) => {
              // Si el logo no carga, ocultarlo
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div style={brandTextStyle}>
            <span style={brandNameStyle}>{brandName}</span>
            <span style={taglineStyle}>{tagline}</span>
          </div>
        </div>
      )}

      {/* Modo colapsado: solo logo */}
      {collapsed && (
        <img
          src={logoSrc}
          alt={brandName}
          style={logoCollapsedStyle}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      {/* Botón de colapsar/expandir con tooltip */}
      <Tooltip
        content={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        position={collapsed ? 'right' : 'bottom'}
      >
        <button
          type="button"
          onClick={onToggle}
          style={{
            ...toggleButtonStyle,
            position: collapsed ? 'absolute' : 'static',
            bottom:   collapsed ? '-14px' : 'auto',
            right:    collapsed ? '50%' : 'auto',
            transform: collapsed ? 'translateX(50%)' : 'none',
            background: collapsed ? 'var(--bg-secondary)' : 'transparent',
            zIndex:     collapsed ? 5 : 'auto',
          }}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <PanelLeftOpen size={14} />
          ) : (
            <PanelLeftClose size={14} />
          )}
        </button>
      </Tooltip>
    </div>
  );
}