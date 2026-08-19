// ¿Qué? Input especializado para contraseñas con toggle de mostrar/ocultar.
// ¿Para qué? Reemplazar el patrón repetido de <input type="password"> + botón
//            con ojo que estaba en Login, ResetPassword y ChangePassword.
// ¿Impacto? Todos los campos de contraseña del sistema usan este componente,
//           garantizando consistencia visual y accesibilidad.

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@components/ui/Input';
import type { InputProps } from '@components/ui/Input';

// ==============================================================================
// TYPES
// ==============================================================================

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  disableToggle?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      disableToggle = false,
      onVisibilityChange,
      autoComplete = 'current-password',
      placeholder = '••••••••',
      ...rest
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);

    // ==============================================================================
    // HANDLERS
    // ==============================================================================

    const handleToggle = (): void => {
      const newVisible = !visible;
      setVisible(newVisible);
      onVisibilityChange?.(newVisible);
    };

    // ==============================================================================
    // ESTILOS DEL BOTÓN DE TOGGLE
    // ==============================================================================

    const toggleButtonStyle: React.CSSProperties = {
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '4px',
      background:     'transparent',
      border:         'none',
      cursor:         disableToggle ? 'not-allowed' : 'pointer',
      color:          'var(--text-tertiary)',
      borderRadius:   '4px',
      transition:     'color 0.15s ease, background 0.15s ease',
      opacity:        disableToggle ? 0.4 : 1,
      outline:        'none',
    };

    // ==============================================================================
    // TOGGLE BUTTON
    // ==============================================================================

    const toggleButton = !disableToggle ? (
      <button
        type="button"
        onClick={handleToggle}
        style={toggleButtonStyle}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        tabIndex={-1}
        onMouseEnter={(e) => {
          if (!disableToggle) {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disableToggle) {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
          }
        }}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    ) : undefined;

    // ==============================================================================
    // RENDER
    // ==============================================================================

    return (
      <Input
        ref={ref}
        {...rest}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        rightIcon={toggleButton}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';