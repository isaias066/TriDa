import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../store/Context';
import { BANKS } from '../data/mockData';
import {
  LayoutDashboard, Globe, Activity, Bell, Users, BarChart3, Settings,
  Sun, Moon, PanelLeftClose, PanelLeftOpen, Clock, Building2, ChevronDown
} from 'lucide-react';
import '../styles/Sidebar.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Mapa en Vivo', icon: Globe },
  { id: 'transactions', label: 'Transacciones', icon: Activity },
  { id: 'alerts', label: 'Alertas', icon: Bell },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'analytics', label: 'Analíticas', icon: BarChart3 },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange, collapsed, setCollapsed }) {
  const { theme, toggleTheme } = useTheme();
  const [selectedBank, setSelectedBank] = useState('all');
  const [bankOpen, setBankOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const ref = useRef(null);
  const cur = BANKS.find(b => b.id === selectedBank) || BANKS[0];

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setBankOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <aside className={`sidebar ${collapsed ? 'sb-collapsed' : ''}`}>
      <div className="sb-brand">
        {!collapsed && (
          <>
            <img src="/logo.png" alt="TriDa" className="sb-logo" />
            <div className="sb-brand-text">
              <span className="sb-name">TriDa</span>
              <span className="sb-tag">Fraud Detection AI</span>
            </div>
          </>
        )}
        {collapsed && <img src="/logo.png" alt="TriDa" className="sb-logo-sm" />}
        <button className="sb-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Abrir' : 'Cerrar'}>
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {!collapsed && (
        <div className="sb-bank" ref={ref}>
          <button className={`bank-btn ${bankOpen ? 'open' : ''}`} onClick={() => setBankOpen(!bankOpen)}>
            <Building2 size={14} strokeWidth={1.5} />
            <span className="bk-dot" style={{ background: cur.color }}></span>
            <span className="bank-btn-name">{cur.name}</span>
            <ChevronDown size={12} className={bankOpen ? 'chev-up' : ''} />
          </button>
          {bankOpen && (
            <div className="bank-dd">
              {BANKS.map(b => (
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
      )}
      {collapsed && (
        <div className="sb-bank-mini">
          <div className="sb-bank-mini-dot" style={{ background: cur.color }} title={cur.name}></div>
        </div>
      )}

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
            </button>
          );
        })}
      </nav>

      <div className="sb-bottom">
        {!collapsed ? (
          <>
            <div className="sb-profile">
              <div className="sb-avatar">AD</div>
              <div className="sb-who">
                <span className="sb-who-name">Admin Demo</span>
                <span className="sb-who-role">Admin</span>
              </div>
            </div>
            <div className="sb-pills">
              <div className="sb-pill sb-pill-time">
                <Clock size={10} />
                <span>{time.toLocaleTimeString('es-CO')}</span>
              </div>
              <div className="sb-pill sb-pill-live on">
                <span className="sb-live-dot-sm"></span>
                <span>LIVE</span>
              </div>
            </div>
            <div className="sb-tiny-stats">
              <span><b>0</b> TXN</span>
              <span><b>0</b>/s</span>
            </div>
            <button className="sb-theme-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
              <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
            </button>
          </>
        ) : (
          <>
            <div className="sb-avatar-mini" title="Admin Demo">AD</div>
            <span className="sb-live-mini on">●</span>
          </>
        )}
      </div>
    </aside>
  );
}
