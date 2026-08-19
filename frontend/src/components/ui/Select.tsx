// ¿Qué? Componente de select estilizado con label, error y accesibilidad.
// ¿Para qué? Estandarizar los selects que estaban dispersos con estilos inline.
// ¿Impacto? Todos los formularios y filtros usan este componente, garantizando
//           consistencia visual y accesibilidad completa.

import {
  forwardRef,
  useId,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { ChevronDown } from 'lucide-react';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string | number = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'children'> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  leftIcon?: ReactNode;
  required?: boolean;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================


function SelectInner<T extends string | number = string>(
  {
    label,
    helperText,
    error,
    options,
    value,
    onChange,
    placeholder,
    leftIcon,
    required = false,
    fullWidth = true,
    wrapperClassName = '',
    id: providedId,
    disabled,
    style,
    className = '',
    ...rest
  }: SelectProps<T>,
  ref: React.Ref<HTMLSelectElement>
) {
  // Generar un ID único si no se proporciona uno (para accesibilidad).
  const generatedId = useId();
  const selectId = providedId ?? generatedId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;

  const hasError = Boolean(error);
  const showHelper = !hasError && helperText;

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '6px',
    width:         fullWidth ? '100%' : 'auto',
    fontFamily:    'Inter, sans-serif',
  };

  const labelStyle: React.CSSProperties = {
    fontSize:   '12px',
    fontWeight: 600,
    color:      hasError ? '#EF4444' : 'var(--text-secondary)',
    display:    'flex',
    alignItems: 'center',
    gap:        '4px',
  };

  const selectContainerStyle: React.CSSProperties = {
    position:   'relative',
    display:    'flex',
    alignItems: 'center',
  };

  const selectStyle: React.CSSProperties = {
    width:            '100%',
    padding:          '10px 14px',
    paddingLeft:      leftIcon ? '36px' : '14px',
    paddingRight:     '36px', // Espacio para el chevron
    fontSize:         '14px',
    fontFamily:       'Inter, sans-serif',
    color:            'var(--text-primary)',
    background:       disabled ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
    border:           `1px solid ${hasError ? '#EF4444' : 'var(--border)'}`,
    borderRadius:     '8px',
    outline:          'none',
    cursor:           disabled ? 'not-allowed' : 'pointer',
    opacity:          disabled ? 0.6 : 1,
    appearance:       'none',
    WebkitAppearance: 'none',
    MozAppearance:    'none',
    transition:       'border-color 0.15s ease, background 0.15s ease',
    ...style,
  };

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

  const chevronStyle: React.CSSProperties = {
    ...iconBaseStyle,
    right: '10px',
  };

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
    <div style={wrapperStyle} className={`ui-select-wrapper ${wrapperClassName}`}>
      {label && (
        <label htmlFor={selectId} style={labelStyle}>
          {label}
          {required && (
            <span style={{ color: '#EF4444' }} aria-label="Campo requerido">
              *
            </span>
          )}
        </label>
      )}

      <div style={selectContainerStyle}>
        {leftIcon && <span style={leftIconStyle}>{leftIcon}</span>}

        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={e => onChange(e.target.value as T)}
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? errorId : showHelper ? helperId : undefined
          }
          className={`ui-select ${className}`}
          style={selectStyle}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option
              key={String(option.value)}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <span style={chevronStyle}>
          <ChevronDown size={16} />
        </span>
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

// ==============================================================================
// EXPORT CON FORWARD REF Y GENÉRICO
// ==============================================================================

export const Select = forwardRef(SelectInner) as <T extends string | number = string>(
  props: SelectProps<T> & { ref?: React.Ref<HTMLSelectElement> }
) => ReturnType<typeof SelectInner>;