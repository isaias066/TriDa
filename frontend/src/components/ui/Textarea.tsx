// ¿Qué? Componente de textarea con label, error y contador de caracteres.
// ¿Para qué? Estandarizar los campos de texto largo para comentarios,
//            justificaciones y descripciones en formularios.
// ¿Impacto? Se usa en validación de alertas, gestión de casos y notas
//           de analistas, garantizando UX y accesibilidad consistente.

import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';

// ==============================================================================
// TYPES
// ==============================================================================

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  fullWidth?: boolean;
  showCharCount?: boolean;
  rows?: number;
  wrapperClassName?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================


export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      required = false,
      fullWidth = true,
      showCharCount = false,
      rows = 4,
      maxLength,
      value,
      wrapperClassName = '',
      id: providedId,
      disabled,
      style,
      className = '',
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = providedId ?? generatedId;
    const helperId = `${textareaId}-helper`;
    const errorId = `${textareaId}-error`;
    const counterId = `${textareaId}-counter`;

    const hasError = Boolean(error);
    const showHelper = !hasError && helperText;

    const currentLength = typeof value === 'string' ? value.length : 0;

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

    const textareaStyle: React.CSSProperties = {
      width:         '100%',
      padding:       '10px 14px',
      fontSize:      '14px',
      fontFamily:    'Inter, sans-serif',
      color:         'var(--text-primary)',
      background:    disabled ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
      border:        `1px solid ${hasError ? '#EF4444' : 'var(--border)'}`,
      borderRadius:  '8px',
      outline:       'none',
      resize:        'vertical',
      minHeight:     `${rows * 22}px`,
      transition:    'border-color 0.15s ease, background 0.15s ease',
      cursor:        disabled ? 'not-allowed' : 'text',
      opacity:       disabled ? 0.6 : 1,
      lineHeight:    '1.5',
      ...style,
    };

    const footerStyle: React.CSSProperties = {
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'center',
      gap:            '8px',
    };

    const messageStyle: React.CSSProperties = {
      fontSize:   '11px',
      color:      hasError ? '#EF4444' : 'var(--text-tertiary)',
      fontWeight: hasError ? 600 : 400,
      flex:       1,
    };

    const getCounterColor = (): string => {
      if (!maxLength) return 'var(--text-tertiary)';
      const percentage = (currentLength / maxLength) * 100;
      if (percentage >= 100) return '#EF4444';
      if (percentage >= 90)  return '#F97316';
      if (percentage >= 75)  return '#FBBF24';
      return 'var(--text-tertiary)';
    };

    const counterStyle: React.CSSProperties = {
      fontSize:   '11px',
      color:      getCounterColor(),
      fontWeight: 500,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    };

    // ==============================================================================
    // RENDER
    // ==============================================================================

    return (
      <div style={wrapperStyle} className={`ui-textarea-wrapper ${wrapperClassName}`}>
        {label && (
          <label htmlFor={textareaId} style={labelStyle}>
            {label}
            {required && (
              <span style={{ color: '#EF4444' }} aria-label="Campo requerido">
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          value={value}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={[
            hasError ? errorId : null,
            showHelper ? helperId : null,
            showCharCount && maxLength ? counterId : null,
          ]
            .filter(Boolean)
            .join(' ') || undefined}
          className={`ui-textarea ${className}`}
          style={textareaStyle}
          {...rest}
        />

        {(hasError || showHelper || (showCharCount && maxLength)) && (
          <div style={footerStyle}>
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

            {showCharCount && maxLength && (
              <span id={counterId} style={counterStyle} aria-live="polite">
                {currentLength} / {maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';