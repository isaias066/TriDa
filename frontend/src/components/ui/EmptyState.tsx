// ¿Qué? Componente para mostrar estados vacíos con ícono, título y acción opcional.
// ¿Para qué? Reemplazar los múltiples mensajes de "sin resultados" que estaban
//            dispersos con estilos inline en Alerts, Users, Transactions.
// ¿Impacto? Todos los estados vacíos del sistema usan este componente,
//           garantizando consistencia visual y UX.

import type { ReactNode } from 'react';
import { Inbox, Search, AlertCircle, PackageX } from 'lucide-react';

// ==============================================================================
// TYPES
// ==============================================================================

export type EmptyStatePreset =
  | 'no-data'      
  | 'no-results'   
  | 'no-alerts'   
  | 'error';       

export type EmptyStateVariant = 'default' | 'success' | 'warning' | 'danger';

export interface EmptyStateProps {
  preset?: EmptyStatePreset;
  icon?: ReactNode;
  title?: string;
  description?: string;
  variant?: EmptyStateVariant;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ==============================================================================
// PRESETS PREDEFINIDOS
// ==============================================================================

const PRESET_DEFAULTS: Record<EmptyStatePreset, {
  icon:        ReactNode;
  title:       string;
  description: string;
  variant:     EmptyStateVariant;
}> = {
  'no-data': {
    icon:        <Inbox size={40} strokeWidth={1.5} />,
    title:       'Sin datos',
    description: 'No hay información para mostrar en este momento.',
    variant:     'default',
  },
  'no-results': {
    icon:        <Search size={40} strokeWidth={1.5} />,
    title:       'Sin resultados',
    description: 'No se encontraron elementos que coincidan con tu búsqueda.',
    variant:     'default',
  },
  'no-alerts': {
    icon:        <PackageX size={40} strokeWidth={1.5} />,
    title:       'Sin alertas activas',
    description: 'El sistema no ha detectado transacciones sospechosas recientes.',
    variant:     'success',
  },
  'error': {
    icon:        <AlertCircle size={40} strokeWidth={1.5} />,
    title:       'Algo salió mal',
    description: 'Ocurrió un error al cargar los datos. Intenta de nuevo.',
    variant:     'danger',
  },
};

// ==============================================================================
// COLORES POR VARIANTE
// ==============================================================================

const VARIANT_COLORS: Record<EmptyStateVariant, string> = {
  default: 'var(--text-tertiary)',
  success: '#34D399',
  warning: '#FBBF24',
  danger:  '#EF4444',
};

// ==============================================================================
// DIMENSIONES POR TAMAÑO
// ==============================================================================

const SIZE_DIMENSIONS: Record<NonNullable<EmptyStateProps['size']>, {
  padding:    string;
  iconSize:   number;
  titleSize:  string;
  descSize:   string;
  gap:        string;
}> = {
  sm: {
    padding:   '20px',
    iconSize:  32,
    titleSize: '13px',
    descSize:  '11px',
    gap:       '8px',
  },
  md: {
    padding:   '40px 20px',
    iconSize:  48,
    titleSize: '15px',
    descSize:  '12px',
    gap:       '12px',
  },
  lg: {
    padding:   '60px 20px',
    iconSize:  64,
    titleSize: '18px',
    descSize:  '13px',
    gap:       '16px',
  },
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function EmptyState({
  preset,
  icon,
  title,
  description,
  variant,
  action,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const presetData = preset ? PRESET_DEFAULTS[preset] : null;

  const finalIcon        = icon        ?? presetData?.icon;
  const finalTitle       = title       ?? presetData?.title;
  const finalDescription = description ?? presetData?.description;
  const finalVariant     = variant     ?? presetData?.variant ?? 'default';

  const dims = SIZE_DIMENSIONS[size];
  const iconColor = VARIANT_COLORS[finalVariant];

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    textAlign:      'center',
    padding:        dims.padding,
    gap:            dims.gap,
    fontFamily:     'Inter, sans-serif',
  };

  const iconWrapperStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    color:          iconColor,
    marginBottom:   '4px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize:   dims.titleSize,
    fontWeight: 700,
    color:      'var(--text-primary)',
    margin:     0,
    lineHeight: 1.3,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize:  dims.descSize,
    color:     'var(--text-tertiary)',
    margin:    0,
    lineHeight: 1.5,
    maxWidth:  '380px',
  };

  const actionStyle: React.CSSProperties = {
    marginTop: '8px',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`ui-empty-state ${className}`}
      style={wrapperStyle}
      role="status"
      aria-live="polite"
    >
      {finalIcon && <div style={iconWrapperStyle}>{finalIcon}</div>}
      {finalTitle && <h3 style={titleStyle}>{finalTitle}</h3>}
      {finalDescription && <p style={descriptionStyle}>{finalDescription}</p>}
      {action && <div style={actionStyle}>{action}</div>}
    </div>
  );
}