import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { getAlertas } from '../services/conexion'; // Conexión a la ruta de Postgres
import '../styles/Alerts.css';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlertas()
      .then(data => setAlerts(data || []))
      .catch(err => console.error("Error al traer alertas al front:", err))
      .finally(() => setLoading(false));
  }, []);

  // Contadores dinámicos filtrando la data real
  const criticas = alerts.filter(a => (a.nivel || a.criticidad || '').toLowerCase() === 'critico' || (a.nivel || '').toLowerCase() === 'critical').length;
  const altas = alerts.filter(a => (a.nivel || a.criticidad || '').toLowerCase() === 'alto' || (a.nivel || '').toLowerCase() === 'high').length;
  const bloqueadas = alerts.filter(a => (a.estado || '').toLowerCase() === 'bloqueada' || (a.estado || '').toLowerCase() === 'blocked').length;

  return (
    <div className="al-page">
      <div className="al-h">
        <div>
          <h2>Centro de Alertas</h2>
          <p>Gestión de alertas de fraude detectadas por el modelo de IA en TriDa</p>
        </div>
        <div className="al-top-right">
          <div className="al-sum">
            <div className="al-sc al-crit">
              <span className="al-sv">{criticas}</span><span className="al-sl">Críticas</span>
            </div>
            <div className="al-sc al-high">
              <span className="al-sv">{altas}</span><span className="al-sl">Altas</span>
            </div>
            <div className="al-sc al-blk">
              <span className="al-sv">{bloqueadas}</span><span className="al-sl">Bloqueadas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="al-body">
        <div className="al-list">
          {loading ? (
            <p style={{ color: 'var(--text-tertiary)', padding: '20px' }}>Consultando alertas en la base de datos...</p>
          ) : alerts.length === 0 ? (
            <div className="al-empty">
              <CheckCircle size={48} color="#34D399" />
              <h3>Sin alertas activas</h3>
              <p>El sistema no ha detectado transacciones sospechosas recientes en la base de datos.</p>
            </div>
          ) : (
            /* LISTADO REAL DE ALERTAS DESDE POSTGRES */
            alerts.map((alerta) => (
              <div key={alerta.id_alerta} className="glass-stat" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', marginBottom: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid #222233', borderRadius: '8px' }}>
                <div style={{ padding: '10px', borderRadius: '5px', background: 'rgba(255, 69, 58, 0.1)', color: '#FF453A' }}>
                  <AlertTriangle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '15px' }}>{alerta.descripcion || 'Actividad inusual en cuenta'}</h4>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    ID Alerta: {alerta.id_alerta} · Fecha: {alerta.fecha_alerta ? new Date(alerta.fecha_alerta).toLocaleString('es-CO') : 'Reciente'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    background: (alerta.nivel || '').toLowerCase() === 'critico' ? '#FF453A22' : '#FF9F0A22',
                    color: (alerta.nivel || '').toLowerCase() === 'critico' ? '#FF453A' : '#FF9F0A',
                    textTransform: 'uppercase'
                  }}>
                    {alerta.nivel || 'Alto'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}