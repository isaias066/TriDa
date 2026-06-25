import { useState, useEffect } from 'react';
import { getClientes } from '../services/conexion'; // Traemos tu conexión real
import '../styles/Users.css';

export default function Users() {
  const [view, setView] = useState('users');
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Llamamos a la base de datos al cargar el componente
  useEffect(() => {
    async function cargarDatos() {
      try {
        const datos = await getClientes();
        setClientes(datos);
      } catch (error) {
        console.error("Error cargando clientes en el Front:", error);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  // Calculamos los contadores dinámicamente con la base de datos
  const totalUsuarios = clientes.length;

  return (
    <div className="up">
      <div className="up-h">
        <div>
          <h2>Usuarios y Dispositivos</h2>
          <p>{totalUsuarios} usuarios registrados en base de datos</p>
        </div>
        <div className="up-tabs">
          <button className={`up-tab ${view === 'users' ? 'act' : ''}`} onClick={() => setView('users')}>Usuarios</button>
          <button className={`up-tab ${view === 'devices' ? 'act' : ''}`} onClick={() => setView('devices')}>Dispositivos</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-tertiary)' }}>
          <p>Cargando datos reales de PostgreSQL...</p>
        </div>
      ) : view === 'users' ? (
        clientes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
            <p>No hay usuarios registrados en la base de datos.</p>
          </div>
        ) : (
          /* TABLA EN VIVO CON TUS DATOS REALES */
          <div style={{ padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', background: '#0a0a12', borderRadius: '8px' }}>
              <thead>
                <tr style={{ background: '#111122', textTransform: 'uppercase', fontSize: '12px' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Nombre Completo</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Identificación</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id_cliente} style={{ borderBottom: '1px solid #222233' }}>
                    <td style={{ padding: '12px' }}>{c.id_cliente}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.nombre_completo}</td>
                    <td style={{ padding: '12px' }}>{c.numero_identificacion}</td>
                    <td style={{ padding: '12px', color: '#818CF8' }}>{c.telefono}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
          <p>No hay dispositivos registrados.</p>
        </div>
      )}
    </div>
  );
}