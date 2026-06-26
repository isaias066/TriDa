import { useState } from 'react';
import { useTheme } from '../store/Context';
import { Sun, Moon, Eye, EyeOff } from 'lucide-react';
import '../styles/Login.css';

// 🟢 AGREGO: Ponemos "onGoToForgot" aquí arriba para recibir la función del padre
export default function Login({ onGoToRegister, onLoginSuccess, onGoToForgot }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulamos la carga del Login de TriDa
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    
    if (onLoginSuccess) onLoginSuccess();
  };

  const goToRegister = (e) => {
    e.preventDefault();
    if (onGoToRegister) onGoToRegister();
  };

  // 🟢 AGREGO: Una función limpia para ir a la vista de recuperar clave
  const goToForgot = (e) => {
    e.preventDefault();
    if (onGoToForgot) onGoToForgot();
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
            <p className="login-tagline">Frontend Demo</p>
          </div>
          <form onSubmit={submit}>
            <div className="fg">
              <label>Correo electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="usuario@trida.co" required />
            </div>
            <div className="fg">
              <label>Contraseña</label>
              <div className="pw-wrap">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required className="pw-input" />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* 🟢 CORRECCIÓN: Ahora llama a goToForgot para que App.jsx haga el cambio de pantalla */}
            <div className="login-forgot-link" style={{ textAlign: 'right', marginBottom: '15px' }}>
              <a href="/forgot" onClick={goToForgot} style={{ color: '#00b4d8', fontSize: '14px', textDecoration: 'none', cursor: 'pointer' }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Iniciar Sesión'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '12px' }}>
              Ingresa cualquier correo y contraseña para continuar.
            </p>

            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '16px' }}>
              ¿No tienes cuenta? <a href="/register" onClick={goToRegister} style={{ color: '#6366F1', cursor: 'pointer', textDecoration: 'underline' }}>Regístrate aquí</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}