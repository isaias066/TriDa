// ¿Qué? Formulario de inicio de sesión con validación y manejo de errores mediante Toasts.
// ¿Para qué? Autenticar al usuario vía AuthContext, redirigir a la app y alertar errores con Toasts premium.
// ¿Impacto? Interfaz limpia con feedback inmediato y moderno en la esquina superior derecha.

import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { PasswordInput } from './PasswordInput';
import { isValidEmail } from '@utils/User';
import { DEFAULT_AUTHENTICATED_ROUTE } from '@constants/Navigation';
import { ApiError } from '@api/Client';

export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
  showForgotPasswordLink?: boolean;
  className?: string;
}

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Estado para el Toast flotante
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const validate = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setToastMessage(null);

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

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(false);
    setLoading(true);

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

      showToast(errorMessage);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={`login-form flex flex-col gap-4.5 font-sans ${className}`}
      style={{ gap: '18px' }}
      noValidate
      aria-label="Formulario de inicio de sesión"
    >
      {/* Toast Flotante de Error */}
      {toastMessage && (
        <div
          role="alert"
          className="fixed right-6 top-6 z-[9999] flex max-w-sm items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-950/80 p-4 text-xs font-bold text-rose-200 shadow-2xl backdrop-blur-md animate-slide-in"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
          <div className="flex-1 leading-snug">{toastMessage}</div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="rounded-lg p-0.5 text-rose-400 hover:bg-rose-900/30 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <Input
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError('');
        }}
        error={emailError}
        placeholder="tu@correo.com"
        leftIcon={<Mail size={16} />}
        autoComplete="email"
        autoFocus
        disabled={loading}
        required
      />

      <PasswordInput
        label="Contraseña"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (passwordError) setPasswordError('');
        }}
        error={passwordError}
        autoComplete="current-password"
        disabled={loading}
        required
      />

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

      {showForgotPasswordLink && (
        <div className="mt-1 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            disabled={loading}
            className="cursor-pointer bg-transparent border-none text-xs font-medium text-[var(--text-secondary)] no-underline transition-colors hover:text-indigo-light focus-visible:text-indigo-light"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}
    </form>
  );
}
