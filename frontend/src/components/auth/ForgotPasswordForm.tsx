// ¿Qué? Formulario para solicitar recuperación de contraseña por email.
// ¿Para qué? Reemplazar el formulario embebido en forgotpassword.jsx con un
//            componente reutilizable con estados de "enviado" y validación.
// ¿Impacto? Se usa dentro de ForgotPasswordPage. Toda la lógica de solicitud
//           de recuperación está encapsulada aquí.

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Send,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Info,
} from 'lucide-react';
import { forgotPassword } from '@api/Auth';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { isValidEmail } from '@utils/User';
import { PUBLIC_ROUTES } from '@constants/Navigation';
import { ApiError } from '@api/Client';

// ==============================================================================
// TYPES
// ==============================================================================

/** Props del ForgotPasswordForm. */
export interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void;
  onError?: (error: Error) => void;
  expirationMinutes?: number;
  className?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ForgotPasswordForm({
  onSuccess,
  onError,
  expirationMinutes = 15,
  className = '',
}: ForgotPasswordFormProps) {

  // ==============================================================================
  // ESTADO
  // ==============================================================================

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  // Errores
  const [emailError, setEmailError] = useState('');
  const [globalError, setGlobalError] = useState('');

  // ==============================================================================
  // VALIDACIÓN
  // ==============================================================================

  /**
   * Valida el email antes de enviar.
   */
  const validate = (): boolean => {
    setEmailError('');
    setGlobalError('');

    if (!email.trim()) {
      setEmailError('El correo es obligatorio');
      return false;
    }

    if (!isValidEmail(email)) {
      setEmailError('Ingresa un correo válido');
      return false;
    }

    return true;
  };

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  /**
   * Maneja el envío del formulario.
   */
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setGlobalError('');

    try {
      const trimmedEmail = email.trim();
      await forgotPassword({ correo: trimmedEmail });

      // Guardar el email para mostrarlo en el mensaje de éxito
      setSentToEmail(trimmedEmail);
      setSent(true);

      onSuccess?.(trimmedEmail);
    } catch (err) {
      const error = err as Error;
      let errorMessage = 'No se pudo procesar la solicitud. Intenta de nuevo.';

      if (err instanceof ApiError) {
        if (err.status >= 500) {
          errorMessage = 'Error del servidor. Intenta de nuevo en unos minutos.';
        } else if (err.status === 429) {
          errorMessage = 'Demasiadas solicitudes. Espera unos minutos antes de intentar de nuevo.';
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


  const handleTryAgain = (): void => {
    setSent(false);
    setEmail('');
    setSentToEmail('');
    setEmailError('');
    setGlobalError('');
  };

  // ==============================================================================
  // ESTILOS COMPARTIDOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '20px',
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

  const iconStyle: React.CSSProperties = {
    flexShrink: 0,
    marginTop:  '1px',
  };

  const backLinkContainerStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'center',
    marginTop:      '4px',
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
  };

  // ==============================================================================
  // RENDER — ESTADO SENT (email enviado)
  // ==============================================================================

  if (sent) {
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

    const successTitleStyle: React.CSSProperties = {
      fontSize:   '16px',
      fontWeight: 700,
      color:      'var(--text-primary)',
      margin:     0,
      lineHeight: 1.3,
    };

    const successMessageStyle: React.CSSProperties = {
      fontSize:   '13px',
      color:      'var(--text-secondary)',
      margin:     0,
      lineHeight: 1.5,
    };

    const emailHighlightStyle: React.CSSProperties = {
      color:      '#34D399',
      fontWeight: 700,
      wordBreak:  'break-all',
    };

    const infoNoteStyle: React.CSSProperties = {
      display:      'flex',
      alignItems:   'flex-start',
      gap:          '8px',
      padding:      '10px 12px',
      background:   'rgba(99, 102, 241, 0.08)',
      border:       '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: '8px',
      fontSize:     '11px',
      color:        'var(--text-secondary)',
      lineHeight:   1.5,
      textAlign:    'left',
    };

    return (
      <div
        className={`forgot-password-form-sent ${className}`}
        style={wrapperStyle}
      >
        <div style={successCardStyle} role="status" aria-live="polite">
          <div style={successIconStyle}>
            <CheckCircle size={28} strokeWidth={2} />
          </div>

          <h3 style={successTitleStyle}>Correo enviado</h3>

          <p style={successMessageStyle}>
            Si <span style={emailHighlightStyle}>{sentToEmail}</span> está
            registrado en el sistema, recibirás un enlace para restablecer
            tu contraseña.
          </p>

          <div style={infoNoteStyle}>
            <Info size={13} style={iconStyle} strokeWidth={2} />
            <span>
              El enlace expira en <strong>{expirationMinutes} minutos</strong>.
              Revisa tu bandeja de entrada y la carpeta de spam.
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={handleTryAgain}
          fullWidth
        >
          Enviar a otro correo
        </Button>

        <div style={backLinkContainerStyle}>
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
  // RENDER — ESTADO INICIAL (formulario)
  // ==============================================================================

  return (
    <form
      onSubmit={handleSubmit}
      className={`forgot-password-form ${className}`}
      style={wrapperStyle}
      noValidate
      aria-label="Formulario de recuperación de contraseña"
    >
      {/* Error global */}
      {globalError && (
        <div style={errorAlertStyle} role="alert" aria-live="assertive">
          <AlertCircle size={14} strokeWidth={2.5} style={iconStyle} />
          <span>{globalError}</span>
        </div>
      )}

      {/* Descripción */}
      <p
        style={{
          fontSize:   '13px',
          color:      'var(--text-secondary)',
          margin:     0,
          lineHeight: 1.5,
        }}
      >
        Ingresa el correo asociado a tu cuenta y te enviaremos un enlace
        para restablecer tu contraseña.
      </p>

      {/* Campo Email */}
      <Input
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError('');
          if (globalError) setGlobalError('');
        }}
        error={emailError}
        placeholder="tu@correo.com"
        leftIcon={<Mail size={16} />}
        autoComplete="email"
        autoFocus
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
        leftIcon={!loading ? <Send size={16} /> : undefined}
      >
        {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
      </Button>

      {/* Link a "Volver al login" */}
      <div style={backLinkContainerStyle}>
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