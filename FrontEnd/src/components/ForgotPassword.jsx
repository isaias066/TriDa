import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../store/Context';
import { Sun, Moon, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import '../styles/Login.css';

export default function ForgotPassword() {
  const [correo,   setCorreo]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState('');
  const { theme, toggleTheme }  = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correo.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
      } else {
        setError(data.error || 'No se pudo enviar el correo');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
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
          {sent ? (
            // ─── ESTADO: Correo enviado ───
            <>
              <div className="login-header">
                <CheckCircle size={56} color="#34D399" style={{ margin: '0 auto 16px', display: 'block' }} />
                <h1>¡Correo enviado!</h1>
                <p className="login-subtitle">Revisa tu bandeja de entrada</p>
              </div>

              <div style={{
                background: 'rgba(52, 211, 153, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                Si <strong>{correo}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                <br/><br/>
                <strong>El enlace expira en 15 minutos.</strong>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: '16px' }}>
                ¿No lo encuentras? Revisa tu carpeta de Spam o correo no deseado.
              </p>

              <Link to="/login" className="login-btn" style={{ textDecoration: 'none' }}>
                <ArrowLeft size={16} /> Volver al inicio de sesión
              </Link>
            </>
          ) : (
            // ─── ESTADO: Formulario ───
            <>
              <div className="login-header">
                <Mail size={48} color="var(--accent)" style={{ margin: '0 auto 16px', display: 'block' }} />
                <h1>Recuperar Contraseña</h1>
                <p className="login-subtitle">
                  Te enviaremos un enlace de recuperación a tu correo
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && <div className="login-err">⚠️ {error}</div>}

                <div className="fg">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                    placeholder="usuario@trida.co"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? <span className="spinner"></span> : 'Enviar Enlace de Recuperación'}
                </button>

                <Link
                  to="/login"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '16px',
                    fontSize: '13px',
                    color: 'var(--accent-light)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  <ArrowLeft size={14} /> Volver al inicio de sesión
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}