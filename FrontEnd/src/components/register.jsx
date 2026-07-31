import { useState } from 'react';
import '../styles/Register.css';

export default function Register({ onGoToLogin, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    usuario: '',
    nombreCompleto: '',
    correo: '',
    contrasena: '',
    confirmar: '',
    rol: 'usuario' // Valor por defecto
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.contrasena !== formData.confirmar) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      // Enviamos exactamente lo que la tabla usuarios_sistemas necesita
      const payload = {
        usuario: formData.usuario.trim(),
        nombre: formData.nombreCompleto.trim(),
        correo: formData.correo.trim(),
        contrasena: formData.contrasena,
        rol: formData.rol
      };

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert('¡Usuario registrado con éxito!');
        if (onRegisterSuccess) onRegisterSuccess();
      } else {
        alert(`Error: ${data.error || 'No se pudo completar el registro'}`);
      }
    } catch (error) {
      console.error('Error enviando el formulario:', error);
      alert('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = (e) => {
    e.preventDefault();
    if (onGoToLogin) onGoToLogin();
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>Crear cuenta</h1>
        <p className="sub">Registra un nuevo usuario en el sistema</p>

        <form onSubmit={handleSubmit}>
          
          <div className="register-field">
            <label htmlFor="usuario">Nombre de usuario (Identificador corto)</label>
            <input type="text" id="usuario" name="usuario" placeholder="Ej: juanperez" 
              value={formData.usuario} onChange={handleChange} required />
          </div>

          <div className="register-field">
            <label htmlFor="nombreCompleto">Nombre Completo</label>
            <input type="text" id="nombreCompleto" name="nombreCompleto" placeholder="Juan Pérez" 
              value={formData.nombreCompleto} onChange={handleChange} required />
          </div>

          <div className="register-field">
            <label htmlFor="correo">Correo corporativo / empresarial</label>
            <input type="email" id="correo" name="correo" placeholder="juan@correo.com" 
              value={formData.correo} onChange={handleChange} required />
          </div>

          <div className="register-field">
            <label htmlFor="rol">Rol asignado</label>
            <select id="rol" name="rol" value={formData.rol} onChange={handleChange} required>
              <option value="usuario">usuario estandar</option>
              <option value="admin">administrador</option>
            </select>
          </div>

          <div className="register-field">
            <label htmlFor="contrasena">Contraseña</label>
            <input type="password" id="contrasena" name="contrasena" placeholder="••••••••" 
              value={formData.contrasena} onChange={handleChange} required />
          </div>

          <div className="register-field">
            <label htmlFor="confirmar">Confirmar contraseña</label>
            <input type="password" id="confirmar" name="confirmar" placeholder="••••••••" 
              value={formData.confirmar} onChange={handleChange} required />
          </div>

          <hr className="register-divider" />

          <button type="submit" disabled={loading}>
            {loading ? 'Procesando registro...' : 'Registrar Cuenta'}
          </button>
        </form>

        <p className="register-login-link">
          ¿Ya tienes cuenta? <a href="/login" onClick={goToLogin}>Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}