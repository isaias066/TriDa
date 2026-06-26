import { useState, useRef, useEffect } from 'react';
import { useTheme, useBank } from '../store/Context';
import {
  LayoutDashboard, Globe, Activity, Bell, Users, BarChart3,
  Settings, LogOut, Sun, Moon, Building2, ChevronDown,
  PanelLeftClose, PanelLeftOpen, Clock
} from 'lucide-react';
import '../styles/Slidebar.css';

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'map',          label: 'Mapa en Vivo',     icon: Globe },
  { id: 'transactions', label: 'Transacciones',    icon: Activity },
  { id: 'alerts',       label: 'Alertas',          icon: Bell },
  { id: 'users',        label: 'Usuarios',         icon: Users },
  { id: 'analytics',    label: 'Analíticas',       icon: BarChart3 },
  { id: 'settings',     label: 'Configuración',    icon: Settings },
];

const USER = { name: 'Admin Demo', email: 'admin@trida.co', avatar: 'AD', role: 'admin' };

export default function Slidebar({ activeTab, onTabChange, alertCount = 0, collapsed, setCollapsed, onLogout }) {
  // 🟢 CONTEXTOS GLOBALES (Con protecciones por si vienen vacíos)
  const themeContext = useTheme();
  const theme = themeContext ? themeContext.theme : 'dark';
  const toggleTheme = themeContext ? themeContext.toggleTheme : () => {};

  const bankContext = useBank();
  const banks = bankContext ? bankContext.banks : [];
  const selectedBank = bankContext ? bankContext.selectedBank : 'all';
  const setSelectedBank = bankContext ? bankContext.setSelectedBank : () => {};

  // 🟢 ESTADOS LOCALES LIMPIOS
  const [bankOpen, setBankOpen] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [totalTxns, setTotalTxns] = useState(0);
  const [time, setTime] = useState(new Date());
  const ref = useRef(null);

  // 1. Efecto para el reloj en tiempo real
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  // 2. Efecto para cerrar el selector de bancos al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setBankOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Contador de transacciones desde el Backend
  useEffect(() => {
    const qs = selectedBank && selectedBank !== 'all'
      ? `?banco=${encodeURIComponent(selectedBank)}`
      : '';
    fetch(`http://localhost:5000/api/transacciones${qs}`)
      .then(res => res.json())
      .then(data => setTotalTxns((data || []).length))
      .catch(err => console.error('Error cargando transacciones:', err));
  }, [selectedBank]);

  // Manejo de la lista de opciones del selector de bancos
  const allOption = { id: 'all', name: 'Todos los bancos', color: '#6366F1' };
  const bankList = [allOption, ...banks];
  const cur = bankList.find(b => b.id === selectedBank) || allOption;

  return (
    <aside className={`slidebar ${collapsed ? 'sb-collapsed' : ''}`}>
      
      {/* SECCIÓN 1: BRAND / LOGO */}
      <div className="sb-brand">
        {!collapsed ? (
          <>
            <img src="/logo.png" alt="TriDa" className="sb-logo" />
            <div className="sb-brand-text">
              <span className="sb-name">TriDa</span>
              <span className="sb-tag">Fraud Detection AI</span>
            </div>
          </>
        ) : (
          <img src="/logo.png" alt="TriDa" className="sb-logo-sm" />
        )}
        <button
          className="sb-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Abrir barra lateral' : 'Cerrar barra lateral'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* SECCIÓN 2: SELECTOR DE BANCO */}
      {!collapsed ? (
        <div className="sb-bank" ref={ref}>
          <button className={`bank-btn ${bankOpen ? 'open' : ''}`} onClick={() => setBankOpen(!bankOpen)}>
            <Building2 size={14} strokeWidth={1.5} />
            <span className="bk-dot" style={{ background: cur.color }}></span>
            <span className="bank-btn-name">{cur.name}</span>
            <ChevronDown size={12} className={bankOpen ? 'chev-up' : ''} />
          </button>

          {bankOpen && (
            <div className="bank-dd">
              {bankList.map(b => (
                <button
                  key={b.id}
                  className={`bank-opt ${selectedBank === b.id ? 'active' : ''}`}
                  onClick={() => { setSelectedBank(b.id); setBankOpen(false); }}
                >
                  <span className="bk-dot" style={{ background: b.color }}></span>
                  <span>{b.name}</span>
                  {selectedBank === b.id && <span className="bchk">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="sb-bank-mini">
          <div className="sb-bank-mini-dot" style={{ background: cur.color }} title={cur.name}></div>
        </div>
      )}

      {/* SECCIÓN 3: MENÚ DE NAVEGACIÓN */}
      <nav className="sb-nav">
        {NAV.map(n => {
          const Icon = n.icon;
          const act = activeTab === n.id;
          return (
            <button
              key={n.id}
              className={`nav-item ${act ? 'active' : ''} ${collapsed ? 'nav-collapsed' : ''}`}
              onClick={() => onTabChange(n.id)}
              title={collapsed ? n.label : ''}
            >
              <Icon size={18} strokeWidth={act ? 2 : 1.5} />
              {!collapsed && <span>{n.label}</span>}
              
              {n.id === 'alerts' && alertCount > 0 && (
                <span className={`nav-badge ${collapsed ? 'nav-badge-sm' : ''}`}>
                  {collapsed ? (alertCount > 9 ? '9+' : alertCount) : (alertCount > 99 ? '99+' : alertCount)}
                </span>
              )}
              {n.id === 'map' && isLive && !collapsed && <span className="nav-live"></span>}
            </button>
          );
        })}
      </nav>

      {/* SECCIÓN 4: PANEL INFERIOR (PERFIL, HORA Y TEMAS) */}
      <div className="sb-bottom">
        {!collapsed ? (
          <>
            <div className="sb-profile">
              <div className="sb-avatar">{USER.avatar}</div>
              <div className="sb-who">
                <span className="sb-who-name">{USER.name.split(' ').slice(0, 2).join(' ')}</span>
                <span className="sb-who-role">
                  {USER.role === 'admin' ? 'Admin' : USER.role === 'analyst' ? 'Analista' : 'Operador'}
                </span>
              </div>
              {/* Al hacer clic aquí, se ejecuta la acción de salir limpia */}
              <button className="sb-logout-sm" onClick={onLogout} title="Salir">
                <LogOut size={14} />
              </button>
            </div>

            <div className="sb-pills">
              <div className="sb-pill sb-pill-time">
                <Clock size={10} />
                <span>{time.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              <button className={`sb-pill sb-pill-live ${isLive ? 'on' : ''}`} onClick={() => setIsLive(!isLive)}>
                <span className="sb-live-dot-sm"></span>
                <span>{isLive ? 'LIVE' : 'OFF'}</span>
              </button>
            </div>

            <div className="sb-tiny-stats">
              <span><b>{totalTxns.toLocaleString()}</b> TXN</span>
              <span><b>{isLive ? '~5' : '0'}</b>/s</span>
            </div>

            <button className="sb-theme-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
              <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
            </button>
          </>
        ) : (
          <>
            <div className="sb-avatar-mini" title={`${USER.name} · ${USER.role}`}>{USER.avatar}</div>
            <span className={`sb-live-mini ${isLive ? 'on' : ''}`}>●</span>
            <button className="sb-logout-mini" onClick={onLogout} title="Salir">
              <LogOut size={14} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}