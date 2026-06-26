import { useState, useEffect } from 'react';
import { useTheme } from '../store/Context';
import {
  UserPlus, Trash2, ShieldCheck, ShieldAlert, Shield, ShieldOff,
  Save, X, User, Brain, Bell, Lock, Settings as SettingsIcon,
  KeyRound, Phone, Mail, Camera, ToggleLeft, ToggleRight
} from 'lucide-react';
import '../styles/Settings.css';

const PERM_LABELS = {
  dashboard:    'Dashboard',
  map:          'Mapa en Vivo',
  transactions: 'Transacciones',
  alerts:       'Alertas',
  users:        'Usuarios',
  analytics:    'Analíticas',
  settings:     'Configuración',
  export:       'Exportar',
  manageUsers:  'Gestionar Usuarios',
  manageRoles:  'Gestionar Roles',
  assignBanks:  'Asignar Bancos',
  manageModel:  'Configurar Modelo IA',
};

const ROLES_LOCAL = [
  { id: 'superAdmin', label: 'Super Admin', color: '#E040FB', desc: 'Acceso total al sistema' },
  { id: 'admin',      label: 'Administrador', color: '#6366F1', desc: 'Gestión de usuarios y configuración' },
  { id: 'analyst',    label: 'Analista',    color: '#06B6D4', desc: 'Visualización y análisis' },
  { id: 'operator',   label: 'Operador',    color: '#10B981', desc: 'Operaciones básicas' },
];

const TABS = [
  { id: 'profile',       label: 'Mi Perfil',       icon: User },
  { id: 'users',         label: 'Usuarios',         icon: UserPlus },
  { id: 'model',         label: 'Modelo IA',        icon: Brain },
  { id: 'notifications', label: 'Notificaciones',   icon: Bell },
  { id: 'roles',         label: 'Roles y Permisos', icon: Lock },
];

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const user = { name: 'Admin Demo', email: 'admin@trida.co', avatar: 'AD', role: 'superAdmin' };

  const [permissions, setPermissions] = useState(() => {
    const defaults = {};
    ROLES_LOCAL.forEach(r => {
      defaults[r.id] = Object.fromEntries(Object.keys(PERM_LABELS).map(k => [k, r.id === 'superAdmin']));
    });
    return defaults;
  });

  const [tab, setTab] = useState('profile');
  const [cfg, setCfg] = useState({
    notifications:      true,
    autoBlock:          true,
    riskThreshold:      80,
    emailAlerts:        true,
    smsAlerts:          false,
    pushAlerts:         true,
    criticalAlerts:     true,
    highAlerts:         true,
    sensitivity:        0.7,
    autoBlockThreshold: 90,
    realtimeAnalysis:   true,
  });

  const toggle = k => setCfg(p => ({ ...p, [k]: !p[k] }));

  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: '+57 300 123 4567',
    twoFA: true,
  });

  const [roleUsers,   setRoleUsers]   = useState([]);
  const [banks,       setBanks]       = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [modal, setModal] = useState(false);
  const [nw, setNw] = useState({ name: '', email: '', role: 'operator', bank: '', status: 'active' });

  const canManageUsers = true; 
  const canManageRoles = true;
  const canManageModel = true;

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    if (tab === 'users') fetchUsers();
  }, [tab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res  = await fetch('http://localhost:5000/api/usuarios');
      const data = await res.json();
      const normalized = data.map(u => ({
        id:            u.id_cliente ?? u.id,
        name:          u.nombre_completo ?? u.nombre_cliente ?? u.nombre ?? 'Usuario',
        email:         u.email ?? u.correo,
        role:          u.rol ?? 'operator',
        bank:          u.codigo_banco ?? '',
        status:        u.estado === false ? 'inactive' : 'active',
        avatar:        (u.nombre_completo || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      }));
      setRoleUsers(normalized);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const res  = await fetch('http://localhost:5000/api/bancos');
      const data = await res.json();
      const normalized = data.map(b => ({
        id:    b.codigo_banco ?? b.id,
        name:  b.nombre_banco ?? b.nombre,
        color: b.color ?? '#6366F1',
      }));
      setBanks(normalized);
      if (normalized.length > 0) setNw(p => ({ ...p, bank: normalized[0].id }));
    } catch (err) {
      console.error('Error cargando bancos:', err);
    }
  };

  const toggleStatus = id => setRoleUsers(p => p.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  const delUser = id => setRoleUsers(p => p.filter(u => u.id !== id));
  const changeRole = (id, r) => setRoleUsers(p => p.map(u => u.id === id ? { ...u, role: r } : u));

  const addUser = () => {
    if (!nw.name || !nw.email) return;
    const av = nw.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    setRoleUsers(p => [...p, { ...nw, id: `u${Date.now()}`, avatar: av }]);
    setNw({ name: '', email: '', role: 'operator', bank: banks[0]?.id ?? '', status: 'active' });
    setModal(false);
  };

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
          {tab === 'profile' && (
            <div className="sp-section">
              <h3><User size={16} /> Mi Perfil</h3>
              <div className="sprof-card">
                <div className="sprof-avatar-wrap">
                  <div className="sprof-avatar">{user.avatar}</div>
                </div>
                <div className="sprof-info">
                  <span className="sprof-role-badge" style={{ background: '#6366F118', color: '#6366F1' }}>Super Admin</span>
                </div>
              </div>
              <div className="sprof-form">
                <div className="sfg"><label><User size={12} /> Nombre</label><input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="sfg"><label><Mail size={12} /> Email</label><input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} /></div>
                <div className="sfg"><label><Phone size={12} /> Teléfono</label><input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
                <button className="sprof-save"><Save size={14} /> Guardar Cambios</button>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="sp-section">
              <div className="srh">
                <h3><UserPlus size={16} /> Gestión de Usuarios</h3>
                <button className="sadd-btn" onClick={() => setModal(true)}><UserPlus size={13} /> Nuevo Usuario</button>
              </div>
              {loadingUsers ? <p>Cargando...</p> : (
                <div className="srt-w">
                  <table className="srt">
                    <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {roleUsers.map(u => (
                        <tr key={u.id}>
                          <td>{u.name}</td><td>{u.email}</td>
                          <td>
                            <select className="srl-sel" value={u.role} onChange={e => changeRole(u.id, e.target.value)}>
                              {ROLES_LOCAL.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                            </select>
                          </td>
                          <td>
                            <button className={`sst-tgl ${u.status}`} onClick={() => toggleStatus(u.id)}>
                              {u.status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                          </td>
                          <td><button className="sdel-btn" onClick={() => delUser(u.id)}><Trash2 size={13} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'model' && (
            <div className="sp-section">
              <h3><Brain size={16} /> Configuración del Modelo de IA</h3>
              <div className="sm-card">
                <div className="smc-body">
                  <div className="si-row">
                    <div className="si-info"><span className="si-l">Bloqueo Automático</span></div>
                    <label className="tgl"><input type="checkbox" checked={cfg.autoBlock} onChange={() => toggle('autoBlock')} /><span className="tgl-s"></span></label>
                  </div>
                  <div className="si-row">
                    <div className="si-info"><span className="si-l">Umbral de Auto-Bloqueo ({cfg.autoBlockThreshold}%)</span></div>
                    <input type="range" min="50" max="100" value={cfg.autoBlockThreshold} onChange={e => setCfg(p => ({ ...p, autoBlockThreshold: +e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Nuevo Usuario</h3>
            <input placeholder="Nombre" value={nw.name} onChange={e => setNw(p => ({ ...p, name: e.target.value }))} />
            <input placeholder="Email" value={nw.email} onChange={e => setNw(p => ({ ...p, email: e.target.value }))} />
            <button onClick={addUser}>Agregar</button>
            <button onClick={() => setModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}