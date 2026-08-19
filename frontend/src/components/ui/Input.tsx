// ¿Qué? Componente de input con label, error, ícono y estados de validación.
// ¿Para qué? Estandarizar los inputs que estaban dispersos con estilos inline
//            y sin accesibilidad completa.
// ¿Impacto? Todos los formularios usan este componente, garantizando
//           consistencia visual y cumplimiento de accesibilidad (WCAG 2.1 AA).

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

// ==============================================================================
// TYPES
// ==============================================================================

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  required?: boolean;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      required = false,
      fullWidth = true,
      wrapperClassName = '',
      id: providedId,
      disabled,
      style,
      className = '',
      ...rest
    },
    ref
  ) => {
    // Generar un ID único si no se proporciona uno (para accesibilidad).
    const generatedId = useId();
    const inputId = providedId ?? generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasError = Boolean(error);
    const showHelper = !hasError && helperText;

    // ==============================================================================
    // ESTILOS DEL WRAPPER
    // ==============================================================================

    const wrapperStyle: React.CSSProperties = {
      display:       'flex',
      flexDirection: 'column',
      gap:           '6px',
      width:         fullWidth ? '100%' : 'auto',
      fontFamily:    'Inter, sans-serif',
    };

    // ==============================================================================
    // ESTILOS DEL LABEL
    // ==============================================================================

    const labelStyle: React.CSSProperties = {
      fontSize:   '12px',
      fontWeight: 600,
      color:      hasError ? '#EF4444' : 'var(--text-secondary)',
      display:    'flex',
      alignItems: 'center',
      gap:        '4px',
    };

    // ==============================================================================
    // ESTILOS DEL CONTENEDOR DEL INPUT (para íconos)
    // ==============================================================================

    const inputContainerStyle: React.CSSProperties = {
      position: 'relative',
      display:  'flex',
      alignItems: 'center',
    };

    // ==============================================================================
    // ESTILOS DEL INPUT
    // ==============================================================================

    const inputStyle: React.CSSProperties = {
      width:         '100%',
      padding:       '10px 14px',
      paddingLeft:   leftIcon  ? '36px' : '14px',
      paddingRight:  rightIcon ? '36px' : '14px',
      fontSize:      '14px',
      fontFamily:    'Inter, sans-serif',
      color:         'var(--text-primary)',
      background:    disabled ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
      border:        `1px solid ${hasError ? '#EF4444' : 'var(--border)'}`,
      borderRadius:  '8px',
      outline:       'none',
      transition:    'border-color 0.15s ease, background 0.15s ease',
      cursor:        disabled ? 'not-allowed' : 'text',
      opacity:       disabled ? 0.6 : 1,
      ...style,
    };

    // ==============================================================================
    // ESTILOS DE LOS ÍCONOS
    // ==============================================================================

    const iconBaseStyle: React.CSSProperties = {
      position:       'absolute',
      top:            '50%',
      transform:      'translateY(-50%)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      color:          hasError ? '#EF4444' : 'var(--text-tertiary)',
      pointerEvents:  'none',
    };

    const leftIconStyle: React.CSSProperties = {
      ...iconBaseStyle,
      left: '10px',
    };

    const rightIconStyle: React.CSSProperties = {
      ...iconBaseStyle,
      right:         '10px',
      pointerEvents: 'auto', 
    };

    // ==============================================================================
    // ESTILOS DE HELPER Y ERROR
    // ==============================================================================

    const messageStyle: React.CSSProperties = {
      fontSize:   '11px',
      color:      hasError ? '#EF4444' : 'var(--text-tertiary)',
      marginTop:  '2px',
      fontWeight: hasError ? 600 : 400,
    };

    // ==============================================================================
    // RENDER
    // ==============================================================================

    return (
      <div style={wrapperStyle} className={`ui-input-wrapper ${wrapperClassName}`}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
            {required && (
              <span style={{ color: '#EF4444' }} aria-label="Campo requerido">
                *
              </span>
            )}
          </label>
        )}

        <div style={inputContainerStyle}>
          {leftIcon && <span style={leftIconStyle}>{leftIcon}</span>}

          <input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : showHelper ? helperId : undefined
            }
            className={`ui-input ${className}`}
            style={inputStyle}
            {...rest}
          />

          {rightIcon && <span style={rightIconStyle}>{rightIcon}</span>}
        </div>

        {hasError && (
          <span id={errorId} role="alert" style={messageStyle}>
            ⚠️ {error}
          </span>
        )}

        {showHelper && (
          <span id={helperId} style={messageStyle}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';