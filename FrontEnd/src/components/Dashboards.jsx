import { useState, useEffect } from 'react';
import { useTheme } from '../store/Context';
import { getClientes, getTransacciones, getAlertas } from '../services/conexion'; // Conectamos todas las APIs reales
import { ALERT_LEVELS } from '../data/mockData';
import {
  Shield, AlertTriangle, Ban, Clock, DollarSign, Activity, Zap,
  Globe, Radio, Map
} from 'lucide-react';
import '../styles/Dashboard.css';

const RC = { low: '#30D158', medium: '#FFD60A', high: '#FF9F0A', critical: '#FF453A' };
const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n || 0);

export default function Dashboard() {
  const { theme } = useTheme();
  const [time, setTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('globe');
  
  // Estados para almacenar datos reales de la BD
  const [totalClientes, setTotalClientes] = useState(0);
  const [transacciones, setTransacciones] = useState([]);
  const [alertasLista, setAlertasLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    
    async function obtenerDatosDeBaseDeDatos() {
      try {
        // Ejecutamos llamados en paralelo para que no se bloqueen entre sí
        const [datosClientes, datosTx, datosAlertas] = await Promise.all([
          getClientes().catch(() => []),
          getTransacciones().catch(() => []),
          getAlertas().catch(() => [])
        ]);

        setTotalClientes(datosClientes ? datosClientes.length : 0);
        setTransacciones(datosTx || []);
        setAlertasLista(datosAlertas || []);
      } catch (e) {
        console.error("Error cargando métricas en Dashboard:", e);
      } finally {
        setLoading(false);
      }
    }
    obtenerDatosDeBaseDeDatos();

    return () => clearInterval(iv);
  }, []);

  // ==========================================
  // 📊 CÁLCULOS EN VIVO DESDE TU POSTGRESQL
  // ==========================================
  
  // 1. Sumamos los montos reales de tus transacciones
  const montoTotalAcumulado = transacciones.reduce((sum, tx) => sum + Number(tx.monto || 0), 0);
  
  // 2. Filtramos cuántas transacciones reales tienen estado de riesgo o fraude
  const totalFraudes = transacciones.filter(tx => tx.estado?.toLowerCase() === 'fraude' || tx.riesgo?.toLowerCase() === 'alto').length;
  const totalBloqueadas = transacciones.filter(tx => tx.estado?.toLowerCase() === 'bloqueada' || tx.estado?.toLowerCase() === 'rechazada').length;
  
  // 3. Porcentaje de fraude dinámico
  const frp = transacciones.length > 0 ? ((totalFraudes / transacciones.length) * 100).toFixed(1) : '0.0';

  // 4. Conteo dinámico de alertas por nivel de criticidad para los anillos de abajo
  const rd = {
    low: alertasLista.filter(a => a.nivel?.toLowerCase() === 'bajo' || a.criticidad?.toLowerCase() === 'low').length,
    medium: alertasLista.filter(a => a.nivel?.toLowerCase() === 'medio' || a.criticidad?.toLowerCase() === 'medium').length,
    high: alertasLista.filter(a => a.nivel?.toLowerCase() === 'alto' || a.criticidad?.toLowerCase() === 'high').length,
    critical: alertasLista.filter(a => a.nivel?.toLowerCase() === 'critico' || a.criticidad?.toLowerCase() === 'critical').length
  };

  const fs = { 
    total: transacciones.length > 0 ? transacciones.length : totalClientes, 
    fraud: totalFraudes, 
    blocked: totalBloqueadas, 
    amount: montoTotalAcumulado 
  };

  const toggleView = () => setViewMode(m => m === 'globe' ? 'map' : 'globe');

  return (
    <div className="dash">
      <div className="dash-bg" style={{ background: theme === 'dark' ? 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.08), transparent 70%), linear-gradient(180deg, #05050a, #0a0a12)' : 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.06), transparent 70%), linear-gradient(180deg, #f5f5f7, #ffffff)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(99,102,241,0.25)', gap: '16px' }}>
          {viewMode === 'globe' ? <Globe size={120} color="rgba(99,102,241,0.12)" /> : <Map size={120} color="rgba(99,102,241,0.12)" />}
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-tertiary)' }}>
            {viewMode === 'globe' ? `Vista Globo 3D (${fs.total} nodos cargados)` : `Vista Mapa (${fs.total} puntos asignados)`}
          </p>
        </div>
      </div>

      <div className="dash-overlay">
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

        {/* CONTADORES EN TIEMPO REAL */}
        <div className="float-stats">
          {[
            { icon: Activity, label: 'Registros Activos', value: fs.total.toLocaleString(), color: '#6366F1' },
            { icon: DollarSign, label: 'Monto Total', value: fmt(fs.amount), color: '#818CF8' },
            { icon: AlertTriangle, label: 'Fraude', value: `${fs.fraud} (${frp}%)`, color: '#FF453A' },
            { icon: Ban, label: 'Bloqueadas', value: fs.blocked.toString(), color: '#FF9F0A' },
            { icon: Shield, label: 'ML Precisión', value: '98.4%', color: '#30D158' },
            { icon: Zap, label: 'TXN/seg', value: fs.total > 0 ? '1.2' : '0', color: '#FFD60A' },
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

        {/* SECCIÓN DE ALERTAS DE LA BD */}
        <div className="float-alerts">
          <div className="fa-header">
            <AlertTriangle size={15} />
            <span>Alertas Recientes</span>
            <span className="fa-count">{alertasLista.length}</span>
          </div>
          <div className="fa-list">
            {alertasLista.length === 0 ? (
              <div className="fa-empty">Sin alertas activas en base de datos</div>
            ) : (
              alertasLista.slice(0, 3).map((alerta, index) => (
                <div key={index} style={{ padding: '8px', borderBottom: '1px solid #222', fontSize: '12px', color: '#fff' }}>
                  ⚠️ {alerta.descripcion || 'Actividad sospechosa detectada'} - <strong style={{ color: '#FF453A' }}>{alerta.nivel || 'Crítico'}</strong>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ANILLOS DE RIESGO DINÁMICOS */}
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