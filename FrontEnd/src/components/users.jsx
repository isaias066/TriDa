import { useEffect, useMemo, useState } from 'react';
import { useBank } from '../store/context';
import { getDispositivos, getUsuarios } from '../services/conexion';
import '../styles/Users.css';

const PAGE_SIZE = 30;

const RC = { low: '#34D399', medium: '#FBBF24', high: '#F97316', critical: '#EF4444' };

function riskLevel(risk) {
  if (risk < 30) return 'low';
  if (risk < 60) return 'medium';
  if (risk < 80) return 'high';
  return 'critical';
}

function initials(name) {
  return String(name).split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
}

function isMobile(type) {
  const v = String(type || '').toLowerCase();
  return ['iphone', 'galaxy', 'pixel', 'redmi', 'huawei', 'mobile', 'android', 'celular', 'smartphone'].some(k => v.includes(k));
}

function normalizeClientes(clientes) {
  return clientes.map((c, index) => {
    const name = c.nombre_completo || `Cliente ${index + 1}`;
    const risk = Number(c.riesgo ?? Math.floor(Math.random() * 100));
    return {
      id:             c.id_cliente,
      name,
      email:          c.email || 'sin-correo@dominio.com',
      status:         c.estado === true ? 'active' : 'inactive',
      risk,
      lvl:            riskLevel(risk),
      lastLogin:      c.fecha_registro || new Date().toISOString(),
      city:           c.ciudad || 'N/D',
      country:        c.pais   || 'N/D',
      phone:          c.telefono || 'N/D',
      avatar:         initials(name),
      bank: {
        id:    c.banco_codigo || 'sin_asignar',
        name:  c.banco        || 'Sin banco',
        color: c.banco_color  || '#6366F1',
      },
    };
  });
}

function normalizeDispositivos(disp) {
  return disp.map((d, index) => ({
    id:         d.id_dispositivo ?? `dev-${index + 1}`,
    clienteId:  d.id_cliente,
    clienteNm:  d.cliente || 'Sin cliente',
    type:       d.tipo_dispositivo || 'Desktop',
    os:         d.sistema_operativo || 'N/D',
    browser:    d.navegador || 'N/D',
    lastUse:    d.fecha_ultimo_uso,
    bank: {
      id:    d.banco_codigo || 'sin_asignar',
      name:  d.banco        || 'Sin banco',
      color: d.banco_color  || '#6366F1',
    },
  }));
}

export default function Users() {
  const { selectedBank } = useBank();

  const [view,         setView]         = useState('users');
  const [expanded,     setExpanded]     = useState(null);
  const [clientes,     setClientes]     = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(1);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      getUsuarios(selectedBank),
      getDispositivos(selectedBank),
    ]).then(([uRes, dRes]) => {
      setClientes(uRes.status === 'fulfilled' && Array.isArray(uRes.value) ? uRes.value : []);
      setDispositivos(dRes.status === 'fulfilled' && Array.isArray(dRes.value) ? dRes.value : []);
    }).finally(() => setLoading(false));
  }, [selectedBank]);

  // Reset de paginación al cambiar de banco, vista o filtro
  useEffect(() => {
    setPage(1);
    setExpanded(null);
  }, [selectedBank, view, showInactive]);

  const allUsers   = useMemo(() => normalizeClientes(clientes), [clientes]);
  const allDevices = useMemo(() => normalizeDispositivos(dispositivos), [dispositivos]);

  // Total activos/inactivos (sobre el total, no la página)
  const activeUsers   = allUsers.filter(u => u.status === 'active').length;
  const inactiveUsers = allUsers.length - activeUsers;

  // Filtra activos/inactivos según el toggle
  const filteredUsers = useMemo(
    () => showInactive ? allUsers : allUsers.filter(u => u.status === 'active'),
    [allUsers, showInactive]
  );

  // Agrupa dispositivos por cliente (para mostrar dentro de la card del usuario)
  const devicesByClient = useMemo(() => {
    const map = new Map();
    allDevices.forEach(d => {
      if (!map.has(d.clienteId)) map.set(d.clienteId, []);
      map.get(d.clienteId).push(d);
    });
    return map;
  }, [allDevices]);

  // Paginación
  const list      = view === 'users' ? filteredUsers : allDevices;
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const pageSafe   = Math.min(page, totalPages);
  const start      = (pageSafe - 1) * PAGE_SIZE;
  const end        = start + PAGE_SIZE;
  const pageItems  = list.slice(start, end);

  const goPrev = () => setPage(p => Math.max(1, p - 1));
  const goNext = () => setPage(p => Math.min(totalPages, p + 1));

  return (
    <div className="up">
      <div className="up-h">
        <div>
          <h2>Clientes y Dispositivos</h2>
          <p>
            {allUsers.length} clientes · {activeUsers} activos · {inactiveUsers} inactivos
            {view === 'devices' && ` · ${allDevices.length} dispositivos`}
          </p>
        </div>
        <div className="up-tabs">
          <button className={`up-tab ${view === 'users'   ? 'act' : ''}`} onClick={() => setView('users')}>Clientes</button>
          <button className={`up-tab ${view === 'devices' ? 'act' : ''}`} onClick={() => setView('devices')}>Dispositivos</button>
        </div>
      </div>

      {/* Barra de control: toggle inactivos + info de página */}
      {!loading && (
        <div className="up-toolbar">
          {view === 'users' && (
            <button
              className={`up-toggle ${showInactive ? 'on' : ''}`}
              onClick={() => setShowInactive(s => !s)}
            >
              {showInactive ? '👁 Ocultar inactivos' : '👁‍🗨 Mostrar inactivos'}
              <em>{inactiveUsers}</em>
            </button>
          )}
          <div className="up-pageinfo">
            {list.length === 0
              ? 'Sin resultados'
              : `Mostrando ${start + 1}-${Math.min(end, list.length)} de ${list.length}`}
          </div>
        </div>
      )}

      {loading ? (
        <div className="up-state">Cargando datos...</div>
      ) : view === 'devices' ? (
        <div className="dv-sec">
          <h3>Dispositivos Registrados</h3>
          {pageItems.length === 0 ? (
            <div className="up-state">No hay dispositivos registrados para este banco.</div>
          ) : (
            <>
              <div className="dv-grid">
                {pageItems.map(d => (
                  <div key={d.id} className="dv-card">
                    <div className="dv-h">
                      <span className="dv-ico">{isMobile(d.type) ? '📱' : '💻'}</span>
                      <div>
                        <h4>{d.type}</h4>
                        <span className="dv-os">{d.os}</span>
                      </div>
                    </div>
                    <div className="dv-body">
                      <div className="dv-r"><span>Cliente</span><strong>{d.clienteNm}</strong></div>
                      <div className="dv-r"><span>Navegador</span><strong>{d.browser}</strong></div>
                      <div className="dv-r"><span>Banco</span><strong style={{ color: d.bank.color }}>{d.bank.name}</strong></div>
                      <div className="dv-r"><span>Último uso</span><strong>{d.lastUse ? new Date(d.lastUse).toLocaleDateString('es-CO') : 'N/D'}</strong></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              <div className="up-pagi">
                <button onClick={goPrev} disabled={pageSafe === 1}>← Anterior</button>
                <span>Página {pageSafe} de {totalPages}</span>
                <button onClick={goNext} disabled={pageSafe === totalPages}>Siguiente →</button>
              </div>
            </>
          )}
        </div>
      ) : pageItems.length === 0 ? (
        <div className="up-state">
          {allUsers.length === 0
            ? 'No hay clientes registrados para este banco.'
            : 'No hay clientes activos. Activa "Mostrar inactivos" para verlos.'}
        </div>
      ) : (
        <>
          <div className="ug">
            {pageItems.map(u => {
              const isExp = expanded === u.id;
              const userDevices = devicesByClient.get(u.id) || [];
              return (
                <div key={u.id} className={`uc ${u.status === 'inactive' ? 'uc-inact' : ''}`}>
                  <div className="uc-h" onClick={() => setExpanded(isExp ? null : u.id)}>
                    <div className="uc-av" style={{ background: u.bank.color, opacity: u.status === 'inactive' ? 0.5 : 1 }}>
                      {u.avatar}
                    </div>
                    <div className="uc-nm">
                      <h4>{u.name}</h4>
                      <span className="uc-role" style={{ color: u.bank.color, background: `${u.bank.color}1A` }}>
                        {u.bank.name}
                      </span>
                    </div>
                    <span className={`usi ${u.status}`}></span>
                    <span className={`exp-i ${isExp ? 'exp-act' : ''}`}>›</span>
                  </div>
                  {isExp && (
                    <div className="uc-exp">
                      <div className="ud"><span>Email</span><strong>{u.email}</strong></div>
                      <div className="ud"><span>Teléfono</span><strong>{u.phone}</strong></div>
                      <div className="ud"><span>Ciudad</span><strong>{u.city}</strong></div>
                      <div className="ud"><span>País</span><strong>{u.country}</strong></div>
                      <div className="ud">
                        <span>Riesgo</span>
                        <span className="rbadge" style={{ background: `${RC[u.lvl]}15`, color: RC[u.lvl] }}>{u.risk}%</span>
                      </div>
                      <div className="ud">
                        <span>Registrado</span>
                        <strong>{new Date(u.lastLogin).toLocaleDateString('es-CO', { dateStyle: 'medium' })}</strong>
                      </div>

                      <div className="uc-dev">
                        <span className="sl">Dispositivos ({userDevices.length})</span>
                        {userDevices.length === 0 ? (
                          <div className="dev-c" style={{ opacity: 0.6 }}>
                            <span className="dev-i"><span className="dev-o">Sin dispositivos registrados</span></span>
                          </div>
                        ) : (
                          userDevices.map(d => (
                            <div key={d.id} className="dev-c" style={{ marginBottom: 6 }}>
                              <span className="dev-ic">{isMobile(d.type) ? '📱' : '💻'}</span>
                              <div className="dev-i">
                                <span className="dev-t">{d.type}</span>
                                <span className="dev-o">{d.os} · {d.browser}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="ur-bar">
                        <div className="ur-fill" style={{ width: `${u.risk}%`, background: RC[u.lvl] }}></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          <div className="up-pagi">
            <button onClick={goPrev} disabled={pageSafe === 1}>← Anterior</button>
            <span>Página {pageSafe} de {totalPages}</span>
            <button onClick={goNext} disabled={pageSafe === totalPages}>Siguiente →</button>
          </div>
        </>
      )}
    </div>
  );
}

