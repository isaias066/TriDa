// ¿Qué? Formulario completo de inicio de sesión con validación y manejo de errores.
// ¿Para qué? Reemplazar el formulario embebido en login.jsx con un componente
//            reutilizable y tipado que consume AuthContext directamente.
// ¿Impacto? Se usa dentro de LoginPage. Toda la lógica de login está encapsulada aquí.

import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { PasswordInput } from './PasswordInput';
import { isValidEmail } from '@utils/User';
import {
  PUBLIC_ROUTES,
  DEFAULT_AUTHENTICATED_ROUTE,
} from '@constants/Navigation';
import { ApiError } from '@api/Client';

// ==============================================================================
// TYPES
// ==============================================================================

export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
  showForgotPasswordLink?: boolean;
  className?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================


export function LoginForm({
  onSuccess,
  onError,
  redirectTo,
  showForgotPasswordLink = true,
  className = '',
}: LoginFormProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ==============================================================================
  // ESTADO
  // ==============================================================================

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Errores de validación
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [globalError, setGlobalError] = useState('');

  // ==============================================================================
  // VALIDACIÓN
  // ==============================================================================

  /**
   * Valida los campos del formulario antes de enviar.
   *
   * @returns `true` si el form es válido.
   */
  const validate = (): boolean => {
    let isValid = true;

    setEmailError('');
    setPasswordError('');
    setGlobalError('');

    if (!email.trim()) {
      setEmailError('El email es obligatorio');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Ingresa un email válido');
      isValid = false;
    }

    if (!password) {
      setPasswordError('La contraseña es obligatoria');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      isValid = false;
    }

    return isValid;
  };

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setGlobalError('');

    try {
      await login(email.trim(), password);

      const from = (location.state as { from?: string })?.from;
      const destination = redirectTo ?? from ?? DEFAULT_AUTHENTICATED_ROUTE;

      onSuccess?.();

      navigate(destination, { replace: true });
    } catch (err) {
      const error = err as Error;

      let errorMessage = 'Error al iniciar sesión. Intenta de nuevo.';

      if (err instanceof ApiError) {
        if (err.status === 401) {
          errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (err.status === 403) {
          errorMessage = 'Tu cuenta está desactivada. Contacta al administrador.';
        } else if (err.status >= 500) {
          errorMessage = 'Error del servidor. Intenta de nuevo en unos minutos.';
        } else {
          errorMessage = err.message || errorMessage;
        }
      }

      setGlobalError(errorMessage);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpia el error global cuando el usuario empieza a escribir de nuevo.
   */
  const clearGlobalError = (): void => {
    if (globalError) setGlobalError('');
  };

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const formStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '18px',
    fontFamily:    'Inter, sans-serif',
  };

  const errorAlertStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'flex-start',
    gap:          '10px',
    padding:      '12px 14px',
    background:   'rgba(239, 68, 68, 0.1)',
    border:       '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '8px',
    fontSize:     '12px',
    color:        '#EF4444',
    fontWeight:   500,
    lineHeight:   1.4,
  };

  const errorIconStyle: React.CSSProperties = {
    flexShrink: 0,
    marginTop:  '1px',
  };

  const forgotLinkContainerStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'center',
    marginTop:      '4px',
  };

  const forgotLinkStyle: React.CSSProperties = {
    fontSize:       '12px',
    color:          'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight:     500,
    transition:     'color 0.15s ease',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <form
      onSubmit={handleSubmit}
      className={`login-form ${className}`}
      style={formStyle}
      noValidate
      aria-label="Formulario de inicio de sesión"
    >
      {/* Error global */}
      {globalError && (
        <div style={errorAlertStyle} role="alert" aria-live="assertive">
          <AlertCircle size={14} strokeWidth={2.5} style={errorIconStyle} />
          <span>{globalError}</span>
        </div>
      )}

      {/* Campo Email */}
      <Input
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError('');
          clearGlobalError();
        }}
        error={emailError}
        placeholder="tu@correo.com"
        leftIcon={<Mail size={16} />}
        autoComplete="email"
        autoFocus
        disabled={loading}
        required
      />

      {/* Campo Contraseña */}
      <PasswordInput
        label="Contraseña"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (passwordError) setPasswordError('');
          clearGlobalError();
        }}
        error={passwordError}
        autoComplete="current-password"
        disabled={loading}
        required
      />

      {/* Botón de submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        leftIcon={!loading ? <LogIn size={16} /> : undefined}
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>

      {/* Link a "¿Olvidaste tu contraseña?" */}
      {showForgotPasswordLink && (
        <div style={forgotLinkContainerStyle}>
          <Link
            to={PUBLIC_ROUTES.FORGOT_PASSWORD}
            style={forgotLinkStyle}
            tabIndex={loading ? -1 : 0}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#818CF8';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      )}
    </form>
  );
}