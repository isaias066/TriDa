import { useState, useEffect, useMemo } from 'react';
import { useBank } from '../store/context';
import { Search, ArrowUp, ArrowDown, ArrowUpDown, X, Download, FileText, FileSpreadsheet, Eye } from 'lucide-react';
import '../styles/Transactions.css';

const RC = { low: '#34D399', medium: '#FBBF24', high: '#F97316', critical: '#EF4444' };
const ALERT_LEVELS = {
  low:      { label: 'Bajo' },
  medium:   { label: 'Medio' },
  high:     { label: 'Alto' },
  critical: { label: 'Crítico' },
};

const fmtCOP = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n || 0);

const normalize = t => ({
  id:         String(t.id_transaccion ?? t.id ?? ''),
  timestamp:  t.fecha_transaccion ?? t.timestamp ?? null,
  user:       t.cliente ?? t.nombre_completo ?? t.user ?? 'Desconocido',
  bank: {
    name:  t.banco       ?? t.bank?.name  ?? '—',
    color: t.banco_color ?? t.color_banco ?? t.bank?.color ?? '#6366F1',
  },
  type:       t.tipo_transaccion ?? t.type      ?? '—',
  amount:     t.monto            ?? t.amount    ?? 0,
  riskScore:  Number(t.score_riesgo ?? t.puntaje_riesgo ?? t.riskScore ?? 0),
  alertLevel: (() => {
    const score = Number(t.score_riesgo ?? t.puntaje_riesgo ?? t.riskScore ?? 0);
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  })(),
  location:       { city: t.ciudad ?? t.location?.city ?? '—' },
  channel:        t.canal              ?? t.channel        ?? '—',
  status:         (t.estado_transaccion ?? t.estado ?? t.status ?? 'approved').toLowerCase(),
  account:        t.cuenta             ?? t.account        ?? '—',
  processingTime: t.tiempo_proceso     ?? t.processingTime ?? '—',
  device:         { type: t.tipo_dispositivo ?? t.device?.type ?? '—' },
});

export default function Transactions() {
  const { selectedBank } = useBank();

  const [rawData,     setRawData]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const [search,      setSearch]      = useState('');
  const [fl,          setFl]          = useState('all');
  const [fs,          setFs]          = useState('all');
  const [sort,        setSort]        = useState('timestamp');
  const [dir,         setDir]         = useState('desc');
  const [page,        setPage]        = useState(0);
  const [selected,    setSelected]    = useState(null);
  const [exportOpen,  setExportOpen]  = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const pp = 30;

  useEffect(() => {
    setLoading(true);
    setError(null);
    const qs = selectedBank && selectedBank !== 'all'
      ? `?banco=${encodeURIComponent(selectedBank)}`
      : '';
    fetch(`http://localhost:5000/api/transacciones${qs}`)
      .then(res => res.json())
      .then(data => { setRawData((data || []).map(normalize)); setPage(0); })
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedBank]);

  const filtered = useMemo(() => {
    let l = [...rawData];
    if (search) {
      const s = search.toLowerCase();
      l = l.filter(t =>
        t.id.toLowerCase().includes(s)            ||
        t.user.toLowerCase().includes(s)          ||
        t.bank.name.toLowerCase().includes(s)     ||
        t.location.city.toLowerCase().includes(s) ||
        t.type.toLowerCase().includes(s)
      );
    }
    if (fl !== 'all') l = l.filter(t => t.alertLevel === fl);
    if (fs !== 'all') l = l.filter(t => t.status.includes(fs));
    l.sort((a, b) => {
      let va = a[sort], vb = b[sort];
      if (sort === 'timestamp') { va = new Date(va); vb = new Date(vb); }
      if (sort === 'amount' || sort === 'riskScore') { va = Number(va); vb = Number(vb); }
      return va < vb ? (dir === 'asc' ? -1 : 1) : va > vb ? (dir === 'asc' ? 1 : -1) : 0;
    });
    return l;
  }, [rawData, search, fl, fs, sort, dir]);

  const paged = filtered.slice(page * pp, (page + 1) * pp);
  const tp    = Math.ceil(filtered.length / pp) || 1;

  const ts = f => {
    if (sort === f) setDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSort(f); setDir('desc'); }
  };

  // Helper para renderizar icono de orden por columna
  const SortIcon = ({ field }) => {
    if (sort !== field) return <ArrowUpDown size={11} className="sort-ico" />;
    return dir === 'asc'
      ? <ArrowUp   size={11} className="sort-ico sort-active" />
      : <ArrowDown size={11} className="sort-ico sort-active" />;
  };

  const exportCSV = () => {
    const header = 'ID,Fecha,Usuario,Banco,Tipo,Monto,Riesgo,Nivel,Ciudad,Canal,Estado\n';
    const rows   = filtered.map(t =>
      `${t.id},${t.timestamp ? new Date(t.timestamp).toLocaleString('es-CO') : '—'},${t.user},${t.bank.name},${t.type},${t.amount},${t.riskScore},${t.alertLevel},${t.location.city},${t.channel},${t.status}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = `transacciones_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const header = 'TRANSACCIONES TRIDA\n' + '='.repeat(60) + '\n\n';
    const rows   = filtered.slice(0, 50).map(t =>
      `${t.id} | ${t.timestamp ? new Date(t.timestamp).toLocaleString('es-CO') : '—'} | ${t.user} | ${t.bank.name} | ${fmtCOP(t.amount)} | Riesgo: ${t.riskScore}% (${t.alertLevel}) | ${t.status}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = `transacciones_${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const showPreview = format => {
    setPreviewData({ format, count: filtered.length, sample: filtered.slice(0, 5) });
  };

  if (loading) return (
    <div className="txn-page">
      <p style={{ padding: 40, color: 'var(--text-secondary)' }}>Cargando transacciones desde PostgreSQL…</p>
    </div>
  );
  if (error) return (
    <div className="txn-page">
      <p style={{ padding: 40, color: '#FF453A' }}>⚠️ Error: {error}</p>
    </div>
  );

  return (
    <div className="txn-page">
      <div className="txn-h">
        <div>
          <h2>Transacciones</h2>
          <p>{filtered.length} registros · Página {page + 1}/{tp}</p>
        </div>
        <div className="txn-actions">
          <button className="txn-exp-btn" onClick={() => setExportOpen(!exportOpen)}>
            <Download size={15}/> Exportar
          </button>
          {exportOpen && (
            <div className="txn-exp-dd">
              <button onClick={() => showPreview('csv')}><FileSpreadsheet size={14}/> CSV <Eye size={12}/></button>
              <button onClick={() => showPreview('pdf')}><FileText size={14}/> PDF <Eye size={12}/></button>
              <button onClick={() => { exportCSV(); setExportOpen(false); }}><FileSpreadsheet size={14}/> Descargar CSV</button>
              <button onClick={() => { exportPDF(); setExportOpen(false); }}><FileText size={14}/> Descargar PDF</button>
            </div>
          )}
        </div>
      </div>

      <div className="txn-f">
        <div className="txn-s">
          <Search size={16}/>
          <input
            placeholder="Buscar ID, usuario, banco, ciudad..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <select value={fl} onChange={e => { setFl(e.target.value); setPage(0); }}>
          <option value="all">Todos los niveles</option>
          <option value="low">Bajo</option>
          <option value="medium">Medio</option>
          <option value="high">Alto</option>
          <option value="critical">Crítico</option>
        </select>
        <select value={fs} onChange={e => { setFs(e.target.value); setPage(0); }}>
          <option value="all">Todos los estados</option>
          <option value="aprobada">Aprobada</option>
          <option value="marcada">Marcada / Sospechosa</option>
          <option value="bloqueada">Bloqueada / Rechazada</option>
        </select>
      </div>

      <div className="txn-body">
        <div className={`txn-tw ${selected ? 'tw-shrink' : ''}`}>
          <table className="txn-t">
            <thead>
              <tr>
                <th onClick={() => ts('id')}        className={`th-sortable ${sort === 'id'        ? 'th-active' : ''}`}>
                  <span>ID</span> <SortIcon field="id" />
                </th>
                <th onClick={() => ts('timestamp')} className={`th-sortable ${sort === 'timestamp' ? 'th-active' : ''}`}>
                  <span>Hora</span> <SortIcon field="timestamp" />
                </th>
                <th>Usuario</th>
                <th>Banco</th>
                <th>Tipo</th>
                <th onClick={() => ts('amount')}    className={`th-sortable ${sort === 'amount'    ? 'th-active' : ''}`}>
                  <span>Monto</span> <SortIcon field="amount" />
                </th>
                <th onClick={() => ts('riskScore')} className={`th-sortable ${sort === 'riskScore' ? 'th-active' : ''}`}>
                  <span>Riesgo</span> <SortIcon field="riskScore" />
                </th>
                <th>Ciudad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>No se encontraron transacciones.</td></tr>
              ) : (
                paged.map(t => (
                  <tr
                    key={t.id}
                    className={`txn-r-${t.alertLevel} ${selected?.id === t.id ? 'txn-r-sel' : ''}`}
                    onClick={() => setSelected(t)}
                  >
                    <td className="mono">{t.id}</td>
                    <td className="mono">{t.timestamp ? new Date(t.timestamp).toLocaleTimeString('es-CO') : '—'}</td>
                    <td>{t.user}</td>
                    <td><span className="bt" style={{ background: `${t.bank.color}20`, color: t.bank.color }}>{t.bank.name}</span></td>
                    <td>{t.type}</td>
                    <td className="mono">{fmtCOP(t.amount)}</td>
                    <td><span className="rbadge" style={{ background: `${RC[t.alertLevel]}15`, color: RC[t.alertLevel] }}>{t.riskScore}%</span></td>
                    <td>{t.location.city}</td>
                    <td>
                      <span className={`stb st-${t.status}`}>
                        {t.status.includes('bloqueada') ? 'Bloqueada' : t.status.includes('marcada') || t.status.includes('alertada') ? 'Marcada' : 'Aprobada'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="txn-detail-panel">
            <div className="tdp-header">
              <h3>Detalle</h3>
              <button className="tdp-close" onClick={() => setSelected(null)}><X size={16}/></button>
            </div>
            <div className="tdp-body">
              <div className="tdp-row tdp-id-row">
                <span className="tdp-id">{selected.id}</span>
                <span className="tdp-level" style={{ color: RC[selected.alertLevel], background: `${RC[selected.alertLevel]}15` }}>
                  {ALERT_LEVELS[selected.alertLevel]?.label ?? selected.alertLevel}
                </span>
              </div>
              <div className="tdp-divider"/>
              <div className="tdp-grid">
                <div className="tdp-field"><span className="tdp-lbl">Usuario</span><span className="tdp-val">{selected.user}</span></div>
                <div className="tdp-field"><span className="tdp-lbl">Cuenta</span><span className="tdp-val mono">{selected.account}</span></div>
                <div className="tdp-field"><span className="tdp-lbl">Banco</span><span className="tdp-val" style={{ color: selected.bank.color }}>{selected.bank.name}</span></div>
                <div className="tdp-field"><span className="tdp-lbl">Tipo</span><span className="tdp-val">{selected.type}</span></div>
                <div className="tdp-field"><span className="tdp-lbl">Monto</span><span className="tdp-val tdp-amount">{fmtCOP(selected.amount)}</span></div>
                <div className="tdp-field"><span className="tdp-lbl">Riesgo</span><span className="tdp-val" style={{ color: RC[selected.alertLevel], fontWeight: 800 }}>{selected.riskScore}%</span></div>
                <div className="tdp-field"><span className="tdp-lbl">Ciudad</span><span className="tdp-val">{selected.location.city}</span></div>
                <div className="tdp-field"><span className="tdp-lbl">Canal</span><span className="tdp-val">{selected.channel}</span></div>
                <div className="tdp-field"><span className="tdp-lbl">Dispositivo</span><span className="tdp-val">{selected.device.type}</span></div>
                <div className="tdp-field">
                  <span className="tdp-lbl">Estado</span>
                  <span className={`tdp-val stb st-${selected.status}`}>
                    {selected.status.includes('bloqueada') ? '🚫 Bloqueada' : selected.status.includes('marcada') || selected.status.includes('alertada') ? '⚠️ Marcada' : '✅ Aprobada'}
                  </span>
                </div>
                <div className="tdp-field"><span className="tdp-lbl">Latencia</span><span className="tdp-val">{selected.processingTime}ms</span></div>
                <div className="tdp-field"><span className="tdp-lbl">Fecha</span><span className="tdp-val">{selected.timestamp ? new Date(selected.timestamp).toLocaleString('es-CO') : '—'}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {previewData && (
        <div className="txn-preview-modal" onClick={() => setPreviewData(null)}>
          <div className="txn-preview-card" onClick={e => e.stopPropagation()}>
            <div className="tpm-header">
              <h3><Eye size={16}/> Vista Previa — {previewData.format.toUpperCase()}</h3>
              <button onClick={() => setPreviewData(null)}><X size={16}/></button>
            </div>
            <div className="tpm-body">
              <p className="tpm-count">{previewData.count} registros a exportar</p>
              <div className="tpm-table">
                <table>
                  <thead><tr><th>ID</th><th>Usuario</th><th>Banco</th><th>Monto</th><th>Riesgo</th></tr></thead>
                  <tbody>
                    {previewData.sample.map(t => (
                      <tr key={t.id}>
                        <td className="mono">{t.id}</td><td>{t.user}</td><td>{t.bank.name}</td>
                        <td className="mono">{fmtCOP(t.amount)}</td>
                        <td style={{ color: RC[t.alertLevel] }}>{t.riskScore}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="tpm-footer">
              <button className="tpm-cancel" onClick={() => setPreviewData(null)}>Cancelar</button>
              <button className="tpm-download" onClick={() => {
                previewData.format === 'csv' ? exportCSV() : exportPDF();
                setPreviewData(null); setExportOpen(false);
              }}>
                <Download size={14}/> Descargar {previewData.format.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {tp > 1 && (
        <div className="txn-pg">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Anterior</button>
          <span>Página {page + 1} de {tp}</span>
          <button disabled={page >= tp - 1} onClick={() => setPage(p => p + 1)}>Siguiente →</button>
        </div>
      )}
    </div>
  );
}


