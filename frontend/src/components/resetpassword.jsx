import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTheme } from '../store/context';
import { Sun, Moon, Eye, EyeOff, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';
import '../styles/Login.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token          = searchParams.get('token');

  const { theme, toggleTheme } = useTheme();

  const [verifying,    setVerifying]    = useState(true);
  const [tokenValid,   setTokenValid]   = useState(false);
  const [tokenEmail,   setTokenEmail]   = useState('');
  const [tokenError,   setTokenError]   = useState('');

  const [password,     setPassword]     = useState('');
  const [confirmPw,    setConfirmPw]    = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState(false);

  // ─── Verificar el token al cargar la página ───
  useEffect(() => {
    if (!token) {
      setTokenError('No se proporcionó un token de recuperación');
      setVerifying(false);
      return;
    }

    fetch(`http://localhost:5000/api/auth/verify-reset-token?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setTokenValid(true);
          setTokenEmail(data.email);
        } else {
          setTokenError(data.error || 'Enlace inválido');
        }
      })
      .catch(() => setTokenError('Error verificando el enlace'))
      .finally(() => setVerifying(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPw) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaContrasena: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al cambiar la contraseña');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);

    } catch (err) {
      console.error(err);
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="orb o1"></div>
        <div className="orb o2"></div>
        <div className="orb o3"></div>
        <div className="grid-ov"></div>
      </div>

      <button className="login-theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="login-container">
        <div className="login-card">

          {/* ─── Verificando token ─── */}
          {verifying && (
            <div className="login-header">
              <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: '0 auto 20px' }}></div>
              <h1>Verificando enlace...</h1>
              <p className="login-subtitle">Por favor espera un momento</p>
            </div>
          )}

          {/* ─── Token inválido o expirado ─── */}
          {!verifying && !tokenValid && (
            <>
              <div className="login-header">
                <AlertTriangle size={56} color="#EF4444" style={{ margin: '0 auto 16px', display: 'block' }} />
                <h1>Enlace inválido</h1>
                <p className="login-subtitle">{tokenError}</p>
              </div>

              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                El enlace de recuperación ha expirado o no es válido. Solicita uno nuevo desde la página de inicio.
              </div>

              <Link to="/forgot-password" className="login-btn" style={{ textDecoration: 'none', marginBottom: '10px' }}>
                Solicitar nuevo enlace
              </Link>
              <Link to="/login" style={{
                display: 'block',
                textAlign: 'center',
                marginTop: '10px',
                fontSize: '13px',
                color: 'var(--text-tertiary)',
                textDecoration: 'none',
              }}>
                Volver al inicio de sesión
              </Link>
            </>
          )}

          {/* ─── Éxito ─── */}
          {!verifying && tokenValid && success && (
            <>
              <div className="login-header">
                <CheckCircle size={56} color="#34D399" style={{ margin: '0 auto 16px', display: 'block' }} />
                <h1>¡Contraseña actualizada!</h1>
                <p className="login-subtitle">Ya puedes iniciar sesión con tu nueva contraseña</p>
              </div>

              <div style={{
                background: 'rgba(52, 211, 153, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                textAlign: 'center',
              }}>
                Redirigiendo al inicio de sesión...
              </div>
            </>
          )}

          {/* ─── Formulario para cambiar contraseña ─── */}
          {!verifying && tokenValid && !success && (
            <>
              <div className="login-header">
                <KeyRound size={48} color="var(--accent)" style={{ margin: '0 auto 16px', display: 'block' }} />
                <h1>Nueva contraseña</h1>
                <p className="login-subtitle">
                  Crea una nueva contraseña para <strong>{tokenEmail}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && <div className="login-err">⚠️ {error}</div>}

                <div className="fg">
                  <label>Nueva contraseña</label>
                  <div className="pw-wrap">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      disabled={loading}
                      autoComplete="new-password"
                      className="pw-input"
                    />
                    <button
                      type="button"
                      className="pw-toggle"
                      onClick={() => setShowPw(!showPw)}
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="fg">
                  <label>Confirmar contraseña</label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Repite la contraseña"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? <span className="spinner"></span> : 'Cambiar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

