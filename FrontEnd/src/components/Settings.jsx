import { useState } from 'react';
import { useTheme } from '../store/Context';
import { User, Bell, Settings as SettingsIcon, Sun, Moon } from 'lucide-react';
import '../styles/Settings.css';

const TABS = [
  { id: 'profile', label: 'Mi Perfil', icon: User },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'system', label: 'Sistema', icon: SettingsIcon },
];

export default function Settings() {
  const [tab, setTab] = useState('profile');
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="sp">
      <div className="sp-h">
        <div>
          <h2>Configuración</h2>
          <p>Ajustes del sistema, perfil y permisos</p>
        </div>
      </div>

      <div className="sp-layout">
        <div className="sp-tabs">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} className={`sp-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                <Icon size={16} /> <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="sp-content">
          <div className="sp-section">
            {tab === 'profile' && (
              <>
                <h3><User size={16} /> Mi Perfil</h3>
                <div className="sprof-card">
                  <div className="sprof-avatar-wrap">
                    <div className="sprof-avatar">AD</div>
                  </div>
                  <div className="sprof-info">
                    <span className="sprof-role-badge" style={{ background: 'rgba(99,102,241,0.18)', color: '#6366f1' }}>Administrador</span>
                  </div>
                </div>
                <div className="sprof-form">
                  <div className="sfg"><label>Nombre</label><input type="text" defaultValue="Admin Demo" /></div>
                  <div className="sfg"><label>Email</label><input type="email" defaultValue="admin@trida.co" /></div>
                  <div className="sfg"><label>Teléfono</label><input type="tel" defaultValue="+57 300 000 0000" /></div>
                </div>
              </>
            )}

            {tab === 'notifications' && (
              <>
                <h3><Bell size={16} /> Notificaciones</h3>
                <p className="sp-desc">Configura los canales de notificación (sin funcionalidad real).</p>
                <div className="sn-grid">
                  <div className="sn-card">
                    <div className="snc-head"><span>Canales</span></div>
                    <div className="snc-body">
                      <div className="si-row"><div className="si-info"><span className="si-l">Email</span><span className="si-d">Alertas por correo</span></div><label className="tgl"><input type="checkbox" defaultChecked /><span className="tgl-s"></span></label></div>
                      <div className="si-row"><div className="si-info"><span className="si-l">SMS</span><span className="si-d">Alertas por mensaje</span></div><label className="tgl"><input type="checkbox" /><span className="tgl-s"></span></label></div>
                      <div className="si-row"><div className="si-info"><span className="si-l">Push In-App</span><span className="si-d">Notificaciones en el dashboard</span></div><label className="tgl"><input type="checkbox" defaultChecked /><span className="tgl-s"></span></label></div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === 'system' && (
              <>
                <h3><SettingsIcon size={16} /> Sistema</h3>
                <p className="sp-desc">Configuración general del frontend.</p>
                <button className="sprof-save" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                  Cambiar a tema {theme === 'dark' ? 'claro' : 'oscuro'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
