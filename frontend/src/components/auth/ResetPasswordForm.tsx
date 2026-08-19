// ¿Qué? Formulario para restablecer contraseña usando un token de recuperación.
// ¿Para qué? Reemplazar el formulario embebido en resetpassword.jsx con verificación
//            de token, validación de fortaleza y contraseñas coincidentes.
// ¿Impacto? Se usa dentro de ResetPasswordPage. Maneja el flujo completo:
//           verificación → cambio → confirmación → redirect.

import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  KeyRound,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { verifyResetToken, resetPassword } from '@api/Auth';
import { Button } from '@components/ui/Button';
import { Spinner } from '@components/ui/Spinner';
import { PasswordInput } from './PasswordInput';
import {
  PasswordStrengthMeter,
  analyzePassword,
} from './PasswordStrengthMeter';
import { PUBLIC_ROUTES } from '@constants/Navigation';
import { ApiError } from '@api/Client';

// ==============================================================================
// TYPES
// ==============================================================================

/** Estados del flujo de reset password. */
type ResetPasswordState =
  | 'verifying'      
  | 'invalid-token' 
  | 'ready'          
  | 'success';       

export interface ResetPasswordFormProps {
  onSuccess?: (email: string) => void;
  onError?: (error: Error) => void;
  redirectDelaySeconds?: number;
  className?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ResetPasswordForm({
  onSuccess,
  onError,
  redirectDelaySeconds = 3,
  className = '',
}: ResetPasswordFormProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  // ==============================================================================
  // ESTADO
  // ==============================================================================

  const [state, setState] = useState<ResetPasswordState>('verifying');
  const [tokenEmail, setTokenEmail] = useState<string>('');
  const [tokenError, setTokenError] = useState<string>('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Errores
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [globalError, setGlobalError] = useState('');

  // ==============================================================================
  // VERIFICACIÓN DEL TOKEN AL MONTAR
  // ==============================================================================

  useEffect(() => {
    if (!token) {
      setState('invalid-token');
      setTokenError('No se proporcionó un token de recuperación.');
      return;
    }

    let cancelled = false;

    const verify = async (): Promise<void> => {
      try {
        const result = await verifyResetToken(token);

        if (cancelled) return;

        if (result.valid && result.email) {
          setTokenEmail(result.email);
          setState('ready');
        } else {
          setState('invalid-token');
          setTokenError(result.error ?? 'El enlace de recuperación no es válido.');
        }
      } catch (err) {
        if (cancelled) return;

        setState('invalid-token');

        if (err instanceof ApiError) {
          if (err.status === 401 || err.status === 400) {
            setTokenError('El enlace ha expirado o ya fue utilizado.');
          } else {
            setTokenError(err.message || 'Error verificando el enlace.');
          }
        } else {
          setTokenError('Error de conexión. Intenta de nuevo.');
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ==============================================================================
  // VALIDACIÓN
  // ==============================================================================

  /**
   * Valida los campos del formulario.
   */
  const validate = (): boolean => {
    let isValid = true;

    setPasswordError('');
    setConfirmError('');
    setGlobalError('');

    // Validar fuerza de la contraseña
    const analysis = analyzePassword(password);
    if (!password) {
      setPasswordError('La contraseña es obligatoria.');
      isValid = false;
    } else if (!analysis.isValid) {
      setPasswordError('La contraseña no cumple con los requisitos de seguridad.');
      isValid = false;
    }

    // Validar coincidencia
    if (!confirmPassword) {
      setConfirmError('Debes confirmar la contraseña.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden.');
      isValid = false;
    }

    return isValid;
  };

  // ==============================================================================
  // HANDLER — Submit
  // ==============================================================================

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setGlobalError('');

    try {
      await resetPassword({
        token,
        nuevaContrasena: password,
      });

      setState('success');
      onSuccess?.(tokenEmail);

      // Redirect automático después del delay
      window.setTimeout(() => {
        navigate(PUBLIC_ROUTES.LOGIN, { replace: true });
      }, redirectDelaySeconds * 1000);
    } catch (err) {
      const error = err as Error;
      let errorMessage = 'No se pudo cambiar la contraseña. Intenta de nuevo.';

      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 400) {
          errorMessage = 'El enlace ha expirado. Solicita uno nuevo.';
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

  // ==============================================================================
  // ESTILOS COMPARTIDOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '18px',
    fontFamily:    'Inter, sans-serif',
  };

  const iconStyle: React.CSSProperties = {
    flexShrink: 0,
    marginTop:  '1px',
  };

  const backLinkStyle: React.CSSProperties = {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            '4px',
    fontSize:       '12px',
    color:          'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight:     500,
    transition:     'color 0.15s ease',
    justifyContent: 'center',
  };

  // ==============================================================================
  // RENDER — ESTADO: verifying (cargando)
  // ==============================================================================

  if (state === 'verifying') {
    return (
      <div
        className={`reset-password-form-verifying ${className}`}
        style={{
          ...wrapperStyle,
          alignItems: 'center',
          padding:    '40px 20px',
        }}
      >
        <Spinner size="lg" label="Verificando enlace..." />
      </div>
    );
  }

  // ==============================================================================
  // RENDER — ESTADO: invalid-token
  // ==============================================================================

  if (state === 'invalid-token') {
    const invalidCardStyle: React.CSSProperties = {
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:           '16px',
      padding:       '24px',
      background:    'rgba(239, 68, 68, 0.08)',
      border:        '1px solid rgba(239, 68, 68, 0.25)',
      borderRadius:  '12px',
      textAlign:     'center',
    };

    const invalidIconStyle: React.CSSProperties = {
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      width:          '56px',
      height:         '56px',
      borderRadius:   '50%',
      background:     'rgba(239, 68, 68, 0.15)',
      color:          '#EF4444',
    };

    return (
      <div
        className={`reset-password-form-invalid ${className}`}
        style={wrapperStyle}
      >
        <div style={invalidCardStyle} role="alert" aria-live="assertive">
          <div style={invalidIconStyle}>
            <AlertTriangle size={28} strokeWidth={2} />
          </div>

          <h3
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Enlace inválido
          </h3>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {tokenError}
          </p>
        </div>

        <Link to={PUBLIC_ROUTES.FORGOT_PASSWORD}>
          <Button variant="primary" fullWidth>
            Solicitar nuevo enlace
          </Button>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link
            to={PUBLIC_ROUTES.LOGIN}
            style={backLinkStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#818CF8';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            <ArrowLeft size={14} />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // RENDER — ESTADO: success
  // ==============================================================================

  if (state === 'success') {
    const successCardStyle: React.CSSProperties = {
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:           '16px',
      padding:       '24px',
      background:    'rgba(52, 211, 153, 0.08)',
      border:        '1px solid rgba(52, 211, 153, 0.25)',
      borderRadius:  '12px',
      textAlign:     'center',
    };

    const successIconStyle: React.CSSProperties = {
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      width:          '56px',
      height:         '56px',
      borderRadius:   '50%',
      background:     'rgba(52, 211, 153, 0.15)',
      color:          '#34D399',
    };

    return (
      <div
        className={`reset-password-form-success ${className}`}
        style={wrapperStyle}
      >
        <div style={successCardStyle} role="status" aria-live="polite">
          <div style={successIconStyle}>
            <CheckCircle size={28} strokeWidth={2} />
          </div>

          <h3
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            ¡Contraseña actualizada!
          </h3>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Tu contraseña se cambió correctamente. Serás redirigido al
            inicio de sesión en unos segundos.
          </p>
        </div>

        <Link to={PUBLIC_ROUTES.LOGIN}>
          <Button variant="primary" fullWidth>
            Iniciar sesión ahora
          </Button>
        </Link>
      </div>
    );
  }

  // ==============================================================================
  // RENDER — ESTADO: ready (formulario)
  // ==============================================================================

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

  const emailInfoStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'center',
    gap:          '8px',
    padding:      '10px 12px',
    background:   'var(--bg-tertiary)',
    borderRadius: '8px',
    fontSize:     '12px',
    color:        'var(--text-secondary)',
  };

  const emailValueStyle: React.CSSProperties = {
    color:      'var(--text-primary)',
    fontWeight: 700,
    wordBreak:  'break-all',
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`reset-password-form ${className}`}
      style={wrapperStyle}
      noValidate
      aria-label="Formulario de nueva contraseña"
    >
      {/* Error global */}
      {globalError && (
        <div style={errorAlertStyle} role="alert" aria-live="assertive">
          <AlertCircle size={14} strokeWidth={2.5} style={iconStyle} />
          <span>{globalError}</span>
        </div>
      )}

      {/* Email al que pertenece el token */}
      <div style={emailInfoStyle}>
        <KeyRound size={14} />
        <span>
          Cambiando contraseña para:{' '}
          <span style={emailValueStyle}>{tokenEmail}</span>
        </span>
      </div>

      {/* Nueva contraseña */}
      <div>
        <PasswordInput
          label="Nueva contraseña"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError('');
            if (globalError) setGlobalError('');
          }}
          error={passwordError}
          autoComplete="new-password"
          disabled={loading}
          autoFocus
          required
        />
        <PasswordStrengthMeter password={password} />
      </div>

      {/* Confirmar contraseña */}
      <PasswordInput
        label="Confirmar contraseña"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (confirmError) setConfirmError('');
          if (globalError) setGlobalError('');
        }}
        error={confirmError}
        autoComplete="new-password"
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
        leftIcon={!loading ? <KeyRound size={16} /> : undefined}
      >
        {loading ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
      </Button>

      {/* Link de volver */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Link
          to={PUBLIC_ROUTES.LOGIN}
          style={backLinkStyle}
          tabIndex={loading ? -1 : 0}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#818CF8';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}
        >
          <ArrowLeft size={14} />
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}