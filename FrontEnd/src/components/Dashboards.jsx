import { useState, useEffect } from 'react';
import { useTheme, useBank } from '../store/Context';
import { getClientes, getTransacciones, getAlertas } from '../services/conexion';
import { ALERT_LEVELS } from '../data/mockData';
import {
  Shield, AlertTriangle, Ban, Clock, DollarSign, Activity, Zap,
  Globe, Radio, Map
} from 'lucide-react';
import '../styles/Dashboard.css';

const RC = { low: '#30D158', medium: '#FFD60A', high: '#FF9F0A', critical: '#FF453A' };

const fmt = n =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(n || 0);

const getRiskColor = (nivel = '') => {
  const n = (nivel || '').toString().toLowerCase().trim();
  if (n === 'bajo'   || n === 'low')                         return RC.low;
  if (n === 'medio'  || n === 'medium' || n === 'moderate')  return RC.medium;
  if (n === 'alto'   || n === 'high')                        return RC.high;
  return RC.critical;
};

const fmtTime = (fecha) => {
  if (!fecha) return '--:--';
  const d = new Date(fecha);
  return isNaN(d.getTime())
    ? '--:--'
    : d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
};

export default function Dashboard() {
  const { theme }                              = useTheme();
  const { selectedBank }                       = useBank();
  const [time, setTime]                        = useState(new Date());
  const [viewMode, setViewMode]                = useState('globe');
  const [totalClientes, setTotalClientes]      = useState(0);
  const [transacciones, setTransacciones]      = useState([]);
  const [alertasLista, setAlertasLista]        = useState([]);
  const [loading, setLoading]                  = useState(true);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    setLoading(true);
    const banco = selectedBank !== 'all' ? selectedBank : undefined;

    async function obtenerDatos() {
      try {
        const [datosClientes, datosTx, datosAlertas] = await Promise.all([
          getClientes().catch(() => []),
          getTransacciones(banco).catch(() => []),
          getAlertas().catch(() => []),
        ]);
        setTotalClientes(datosClientes ? datosClientes.length : 0);
        setTransacciones(datosTx || []);
        setAlertasLista(datosAlertas || []);
      } catch (e) {
        console.error('Error cargando Dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    obtenerDatos();
  }, [selectedBank]);

  const montoTotal   = transacciones.reduce((s, tx) => s + Number(tx.monto || 0), 0);
  const totalFraudes = transacciones.filter(
    tx => tx.estado?.toLowerCase() === 'fraude' || tx.riesgo?.toLowerCase() === 'alto'
  ).length;
  const totalBloqueadas = transacciones.filter(
    tx => tx.estado?.toLowerCase() === 'bloqueada' || tx.estado?.toLowerCase() === 'rechazada'
  ).length;
  const frp = transacciones.length > 0
    ? ((totalFraudes / transacciones.length) * 100).toFixed(1)
    : '0.0';

  const clasificarNivel = (a) => {
    const n = (a.nivel || a.criticidad || '').toString().toLowerCase().trim();
    if (n === 'bajo'   || n === 'low')                         return 'low';
    if (n === 'medio'  || n === 'medium' || n === 'moderate')  return 'medium';
    if (n === 'alto'   || n === 'high')                        return 'high';
    return 'critical';
  };

  const rd = {
    low:      alertasLista.filter(a => clasificarNivel(a) === 'low').length,
    medium:   alertasLista.filter(a => clasificarNivel(a) === 'medium').length,
    high:     alertasLista.filter(a => clasificarNivel(a) === 'high').length,
    critical: alertasLista.filter(a => clasificarNivel(a) === 'critical').length,
  };

  const fs = {
    total:   transacciones.length > 0 ? transacciones.length : totalClientes,
    fraud:   totalFraudes,
    blocked: totalBloqueadas,
    amount:  montoTotal,
  };

  const toggleView = () => setViewMode(m => m === 'globe' ? 'map' : 'globe');

  return (
    <div className="dash">
      <div
        className="dash-bg"
        style={{
          background: theme === 'dark'
            ? 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.08), transparent 70%), linear-gradient(180deg, #05050a, #0a0a12)'
            : 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.06), transparent 70%), linear-gradient(180deg, #f5f5f7, #ffffff)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
          {viewMode === 'globe'
            ? <Globe size={120} color="rgba(99,102,241,0.12)" />
            : <Map   size={120} color="rgba(99,102,241,0.12)" />
          }
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-tertiary)' }}>
            {viewMode === 'globe'
              ? `Vista Globo 3D (${fs.total} nodos cargados)`
              : `Vista Mapa (${fs.total} puntos asignados)`}
          </p>
        </div>
      </div>

      <div className="dash-overlay">

        {/* Top bar */}
        <div className="float-top">
          <div className="float-brand">
            <img src="/logo.png" alt="TriDa" className="float-logo" />
            <div>
              <h1>Panel de Control</h1>
              <p>Detección de Fraude con IA</p>
            </div>
          </div>
          <div className="float-controls">
            <button className="view-toggle" onClick={toggleView}>
              {viewMode === 'globe' ? <Map size={16} /> : <Globe size={16} />}
              <span>{viewMode === 'globe' ? 'Mapa' : 'Globo'}</span>
            </button>
            <div className="live-pill"><Radio size={12} /> LIVE</div>
            <div className="float-clock">
              <Clock size={13} />
              {time.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="float-stats">
          {[
            { icon: Activity,      label: 'Registros Activos', value: fs.total.toLocaleString(),  color: '#6366F1' },
            { icon: DollarSign,    label: 'Monto Total',       value: fmt(fs.amount),             color: '#818CF8' },
            { icon: AlertTriangle, label: 'Fraude',            value: `${fs.fraud} (${frp}%)`,    color: '#FF453A' },
            { icon: Ban,           label: 'Bloqueadas',        value: fs.blocked.toString(),       color: '#FF9F0A' },
            { icon: Shield,        label: 'ML Precisión',      value: '98.4%',                     color: '#30D158' },
            { icon: Zap,           label: 'TXN/seg',           value: fs.total > 0 ? '1.2' : '0', color: '#FFD60A' },
          ].map((s, i) => (
            <div key={i} className="glass-stat">
              <div className="gs-icon" style={{ background: `${s.color}18`, color: s.color }}>
                <s.icon size={16} strokeWidth={1.8} />
              </div>
              <div className="gs-info">
                <span className="gs-val">{s.value}</span>
                <span className="gs-lbl">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts panel */}
        <div className="float-alerts">
          <div className="fa-header">
            <AlertTriangle size={15} />
            <span>Alertas Recientes</span>
            <span className="fa-count">{alertasLista.length}</span>
          </div>
          <div className="fa-list">
            {alertasLista.length === 0 ? (
              <div className="fa-empty">
                {loading ? 'Cargando alertas...' : 'Sin alertas activas'}
              </div>
            ) : (
              alertasLista.slice(0, 70).map((alerta, index) => {
                const color       = getRiskColor(alerta.nivel || alerta.criticidad);
                const nivel       = alerta.nivel || alerta.criticidad || 'Crítico';
                const descripcion = alerta.descripcion || alerta.mensaje || 'Actividad sospechosa detectada';
                const id          = alerta.id
                  ? `#${String(alerta.id).padStart(4, '0')}`
                  : `#${String(index + 1).padStart(4, '0')}`;
                const hora   = fmtTime(alerta.fecha || alerta.createdAt || alerta.timestamp);
                const monto  = alerta.monto ? fmt(Number(alerta.monto)) : null;
                const origen = alerta.origen || alerta.tipo || alerta.categoria || null;

                return (
                  <div key={alerta.id ?? index} className="fa-item">
                    <div className="fa-dot" style={{ background: color }} />
                    <div className="fa-body">
                      <div className="fa-r1">
                        <span className="fa-id">{id}</span>
                        <span className="fa-time">{hora}</span>
                      </div>
                      <div className="fa-r2">
                        <span>{descripcion}</span>
                        {origen && <span>· {origen}</span>}
                      </div>
                      <div className="fa-r3">
                        {monto && <span className="fa-amt">{monto}</span>}
                        <span className="fa-risk" style={{ color }}>
                          {nivel.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Risk rings */}
        <div className="float-risk">
          {Object.entries(rd).map(([k, v]) => (
            <div key={k} className="fr-item">
              <div className="fr-ring" style={{ borderColor: RC[k] }}>
                <span style={{ color: RC[k] }}>{v}</span>
              </div>
              <span className="fr-label">{ALERT_LEVELS[k]?.label || k}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}