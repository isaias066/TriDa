import { useState } from 'react';

export default function ForgotPassword({ onGoToLogin }) {
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Conectamos directo con el endpoint que ya tienes encendido en el backend
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correo.trim() }), // Enviamos "correo" en minúsculas
      });

      const data = await response.json();

      if (response.ok) {
        alert('¡Correo de recuperación enviado con éxito! Revisa tu bandeja de entrada de Gmail.');
      } else {
        alert(`Error: ${data.error || 'No se pudo enviar el correo'}`);
      }
    } catch (error) {
      console.error('Error al solicitar recuperación:', error);
      alert('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page"> {/* Reutiliza tus mismos estilos de CSS para que se vea igual de lindo */}
      <div className="register-card">
        <h1>Recuperar Contraseña</h1>
        <p className="sub">Ingresa tu correo electrónico para enviarte un enlace de acceso</p>

        <form onSubmit={handleSubmit}>
          <div className="register-field">
            <label htmlFor="correo">Correo corporativo / empresarial</label>
            <input 
              type="email" 
              id="correo" 
              placeholder="juan@correo.com" 
              value={correo} 
              onChange={(e) => setCorreo(e.target.value)} 
              required 
            />
          </div>

          <hr className="register-divider" />

          <button type="submit" disabled={loading}>
            {loading ? 'Enviando correo...' : 'Enviar Enlace de Recuperación'}
          </button>
        </form>

        <p className="register-login-link">
          ¿Recordaste tu clave? <a href="/login" onClick={(e) => { e.preventDefault(); if (onGoToLogin) onGoToLogin(); }}>Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}