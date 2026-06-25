import { useState, useEffect } from 'react';        
import { Search, ArrowUpDown } from 'lucide-react';
import { getTransacciones } from '../services/conexion';
import '../styles/Transactions.css';

const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n || 0);

export default function Transactions() {
  const [search, setSearch] = useState('');
  const [fl, setFl] = useState('all'); // Filtro de nivel de riesgo
  const [fs, setFs] = useState('all'); // Filtro de estado
  const [page, setPage] = useState(0);
  const pp = 30;

  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTransacciones()
      .then(data => setTransacciones(data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filtrado inteligente protegiendo campos nulos de Postgres
  const filtered = transacciones.filter(t => {
    const term = search.toLowerCase();
    
    // Convertimos de forma segura a String para evitar que explote si hay nulls
    const cliente = (t.cliente || t.nombre_completo || '').toLowerCase();
    const banco = (t.banco || '').toLowerCase();
    const ciudad = (t.ciudad || '').toLowerCase();
    const id = String(t.id_transaccion || '');

    const cumpleBusqueda = search === '' || 
      cliente.includes(term) || 
      banco.includes(term) || 
      ciudad.includes(term) ||
      id.includes(term);

    // Mapeo dinámico de filtros
    const riesgo = (t.score_riesgo || t.riesgo || '').toLowerCase();
    const cumpleRiesgo = fl === 'all' || riesgo.includes(fl);

    const estado = (t.estado_transaccion || t.estado || '').toLowerCase();
    const cumpleEstado = fs === 'all' || estado.includes(fs);

    return cumpleBusqueda && cumpleRiesgo && cumpleEstado;
  });

  const tp = Math.ceil(filtered.length / pp) || 1;

  if (loading) {
    return <div className="txn-page"><p style={{ padding: 40, color: 'white' }}>Cargando transacciones reales desde PostgreSQL...</p></div>;
  }
  if (error) {
    return <div className="txn-page"><p style={{ padding: 40, color: '#FF453A' }}>⚠️ Error al conectar transacciones: {error}</p></div>;
  }

  return (
    <div className="txn-page">
      <div className="txn-h">
        <div><h2>Transacciones</h2><p>{filtered.length} registros encontrados · Página {page+1}/{tp}</p></div>
      </div>
      <div className="txn-f">
        <div className="txn-s">
          <Search size={16} />
          <input placeholder="Buscar ID, usuario, banco, ciudad..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <select value={fl} onChange={e => { setFl(e.target.value); setPage(0); }}>
          <option value="all">Todos los niveles de riesgo</option>
          <option value="low">Bajo (Low)</option>
          <option value="medium">Medio (Medium)</option>
          <option value="high">Alto (High)</option>
          <option value="critical">Crítico (Critical)</option>
        </select>
        <select value={fs} onChange={e => { setFs(e.target.value); setPage(0); }}>
          <option value="all">Todos los estados</option>
          <option value="aprobada">Aprobada</option>
          <option value="marcada">Marcada / Sospechosa</option>
          <option value="bloqueada">Bloqueada / Rechazada</option>
        </select>
      </div>
      <div className="txn-body">
        <div className="txn-tw">
          <table className="txn-t">
            <thead>
              <tr>
                <th>ID <ArrowUpDown size={10} /></th>
                <th>Hora <ArrowUpDown size={10} /></th>
                <th>Usuario</th>
                <th>Banco</th>
                <th>Tipo</th>
                <th>Monto <ArrowUpDown size={10} /></th>
                <th>Riesgo <ArrowUpDown size={10} /></th>
                <th>Ciudad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    No se encontraron transacciones en la base de datos que coincidan.
                  </td>
                </tr>
              ) : (
                filtered.slice(page * pp, (page + 1) * pp).map(t => (
                  <tr key={t.id_transaccion}>
                    <td>{t.id_transaccion}</td>
                    <td>{t.fecha_transaccion ? new Date(t.fecha_transaccion).toLocaleTimeString('es-CO') : '—'}</td>
                    <td style={{ fontWeight: 'bold' }}>{t.cliente || t.nombre_completo || 'Desconocido'}</td>
                    <td>{t.banco || '—'}</td>
                    <td>{t.tipo_transaccion || '—'}</td>
                    <td style={{ color: '#30D158', fontWeight: 600 }}>{fmt(t.monto)}</td>
                    <td style={{ 
                      color: (t.score_riesgo || '').toLowerCase() === 'high' || (t.score_riesgo || '').toLowerCase() === 'critical' ? '#FF453A' : '#30D158'
                    }}>
                      {t.score_riesgo || t.riesgo || 'Bajo'}
                    </td>
                    <td>{t.ciudad || '—'}</td>
                    <td>
                      <span className={`status-pill ${(t.estado_transaccion || '').toLowerCase()}`}>
                        {t.estado_transaccion || 'Completada'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 