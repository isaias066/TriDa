import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../store/Context';
import { useAuth } from '../store/AuthContext';
import { Sun, Moon, Eye, EyeOff } from 'lucide-react';
import '../styles/Login.css';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const { theme, toggleTheme } = useTheme();
  const { login }              = useAuth();
  const navigate               = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
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
          <div className="login-header">
            <img src="/logo.png" alt="TriDa" className="login-logo" />
            <h1>TriDa</h1>
            <p className="login-subtitle">Monitor de Transacciones con IA</p>
            <p className="login-tagline">Inicia sesión con tu cuenta</p>
          </div>

          <form onSubmit={submit}>
            {error && <div className="login-err">⚠️ {error}</div>}

            <div className="fg">
              <label>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@trida.co"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="fg">
              <label>Contraseña</label>
              <div className="pw-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
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

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Iniciar Sesión'}
            </button>

            <Link
              to="/forgot-password"
              style={{
                display: 'block',
                textAlign: 'center',
                marginTop: '16px',
                fontSize: '13px',
                color: 'var(--accent-light)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}