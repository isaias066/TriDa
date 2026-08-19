// ¿Qué? Componente de card contenedor reutilizable con variantes y sub-componentes.
// ¿Para qué? Estandarizar los contenedores visuales que estaban dispersos con
//            estilos inline en Dashboard, Analytics, Settings, etc.
// ¿Impacto? Cualquier "caja" con contenido usa este componente, garantizando
//           consistencia visual en padding, bordes y elevaciones.

import type { HTMLAttributes, ReactNode } from 'react';

// ==============================================================================
// TYPES
// ==============================================================================

export type CardVariant =
  | 'default'   
  | 'elevated' 
  | 'outlined'  
  | 'ghost';   

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  clickable?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

/** Props del CardBody. */
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Props del CardFooter. */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Alineación del contenido. Default: 'end'. */
  align?: 'start' | 'center' | 'end' | 'between';
}

// ==============================================================================
// ESTILOS POR VARIANTE
// ==============================================================================

const VARIANT_STYLES: Record<CardVariant, React.CSSProperties> = {
  default: {
    background:   'var(--bg-secondary)',
    border:       '1px solid var(--border)',
    boxShadow:    'none',
  },
  elevated: {
    background:   'var(--bg-secondary)',
    border:       '1px solid var(--border)',
    boxShadow:    '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  outlined: {
    background:   'transparent',
    border:       '1px solid var(--border)',
    boxShadow:    'none',
  },
  ghost: {
    background:   'transparent',
    border:       'none',
    boxShadow:    'none',
  },
};

// ==============================================================================
// ESTILOS POR PADDING
// ==============================================================================

const PADDING_STYLES: Record<CardPadding, string> = {
  none: '0',
  sm:   '12px',
  md:   '16px',
  lg:   '24px',
};

// ==============================================================================
// ALINEACIÓN DEL FOOTER
// ==============================================================================

const FOOTER_ALIGN: Record<NonNullable<CardFooterProps['align']>, React.CSSProperties['justifyContent']> = {
  start:   'flex-start',
  center:  'center',
  end:     'flex-end',
  between: 'space-between',
};

// ==============================================================================
// COMPONENTE PRINCIPAL — Card
// ==============================================================================

export function Card({
  variant = 'default',
  padding = 'md',
  clickable = false,
  fullWidth = true,
  children,
  style,
  className = '',
  ...rest
}: CardProps) {
  const cardStyle: React.CSSProperties = {
    ...VARIANT_STYLES[variant],
    padding:      PADDING_STYLES[padding],
    borderRadius: '12px',
    width:        fullWidth ? '100%' : 'auto',
    cursor:       clickable ? 'pointer' : 'default',
    transition:   clickable ? 'transform 0.15s ease, box-shadow 0.15s ease' : 'none',
    ...style,
  };

  return (
    <div
      className={`ui-card ${clickable ? 'ui-card-clickable' : ''} ${className}`}
      style={cardStyle}
      {...rest}
    >
      {children}
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — CardHeader
// ==============================================================================

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  children,
  style,
  className = '',
  ...rest
}: CardHeaderProps) {
  const headerStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            '12px',
    marginBottom:   '12px',
    fontFamily:     'Inter, sans-serif',
    ...style,
  };

  const leftStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '10px',
    flex:       1,
    minWidth:   0,
  };

  const titleGroupStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
    minWidth:      0,
    flex:          1,
  };

  const titleStyle: React.CSSProperties = {
    fontSize:   '14px',
    fontWeight: 700,
    color:      'var(--text-primary)',
    margin:     0,
    lineHeight: 1.3,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize:   '11px',
    color:      'var(--text-tertiary)',
    margin:     0,
    lineHeight: 1.4,
  };

  const iconStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    color:      'var(--text-secondary)',
    flexShrink: 0,
  };

  const actionStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '8px',
    flexShrink: 0,
  };

  return (
    <div className={`ui-card-header ${className}`} style={headerStyle} {...rest}>
      {children ? (
        children
      ) : (
        <>
          <div style={leftStyle}>
            {icon && <span style={iconStyle}>{icon}</span>}
            <div style={titleGroupStyle}>
              {title && <h3 style={titleStyle}>{title}</h3>}
              {subtitle && <span style={subtitleStyle}>{subtitle}</span>}
            </div>
          </div>
          {action && <div style={actionStyle}>{action}</div>}
        </>
      )}
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — CardBody
// ==============================================================================

export function CardBody({
  children,
  style,
  className = '',
  ...rest
}: CardBodyProps) {
  const bodyStyle: React.CSSProperties = {
    color:      'var(--text-primary)',
    fontFamily: 'Inter, sans-serif',
    fontSize:   '13px',
    lineHeight: 1.5,
    ...style,
  };

  return (
    <div className={`ui-card-body ${className}`} style={bodyStyle} {...rest}>
      {children}
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — CardFooter
// ==============================================================================

export function CardFooter({
  children,
  align = 'end',
  style,
  className = '',
  ...rest
}: CardFooterProps) {
  const footerStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: FOOTER_ALIGN[align],
    gap:            '8px',
    marginTop:      '16px',
    paddingTop:     '12px',
    borderTop:      '1px solid var(--border)',
    fontFamily:     'Inter, sans-serif',
    ...style,
  };

  return (
    <div className={`ui-card-footer ${className}`} style={footerStyle} {...rest}>
      {children}
    </div>
  );
}