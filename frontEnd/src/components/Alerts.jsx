import { useState, useEffect, useMemo } from 'react';
import { useBank } from '../store/Context';
import { ShieldAlert, ShieldX, CheckCircle, Zap, X, Download, FileText, FileSpreadsheet, Eye } from 'lucide-react';
import '../styles/Alerts.css';

const RC = { low: '#34D399', medium: '#FBBF24', high: '#F97316', critical: '#EF4444' };
const ALERT_LEVELS = {
  critical: { label: 'CRÍTICA' },
  high:     { label: 'ALTA' },
  medium:   { label: 'MEDIA' },
  low:      { label: 'BAJA' },
};

const fmtCOP = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n || 0);

const normalizeAlert = (alerta) => {
  const nivelRaw = (alerta.nivel_criticidad || alerta.nivel || alerta.criticidad || 'MEDIA').toUpperCase();
  let alertLevel = 'medium';
  if (nivelRaw === 'CRITICA' || nivelRaw === 'CRÍTICA' || nivelRaw === 'CRITICAL') alertLevel = 'critical';
  else if (nivelRaw === 'ALTA' || nivelRaw === 'HIGH') alertLevel = 'high';
  else if (nivelRaw === 'BAJA' || nivelRaw === 'LOW') alertLevel = 'low';

  const estadoTxnRaw = (alerta.estado_transaccion || '').toUpperCase();
  let status = 'flagged';
  if (estadoTxnRaw === 'BLOQUEADA') status = 'blocked';
  else if (estadoTxnRaw === 'APROBADA') status = 'approved';
  else if (estadoTxnRaw === 'ALERTADA') status = 'flagged';

  return {
    id:         alerta.id_alerta ?? 'N/A',
    timestamp:  alerta.fecha_generacion ?? new Date(),
    user:       alerta.cliente ?? 'Usuario Desconocido',
    account:    alerta.cuenta ?? 'N/A',
    bank: {
      name:  alerta.banco        ?? 'Banco General',
      color: alerta.banco_color  ?? '#6366F1',
      code:  alerta.banco_codigo ?? '',
    },
    type:       alerta.tipo_transaccion ?? 'Actividad Inusual',
    amount:     Number(alerta.monto ?? 0),
    riskScore:  Number(alerta.score_riesgo ?? 0),
    alertLevel,
    status,
    location:   { city: alerta.ciudad ?? 'Desconocida' },
    channel:    alerta.canal ?? 'Web',
    device:     { type: alerta.dispositivo ?? 'Desconocido' },
    isFraud:    alertLevel === 'critical' || status === 'blocked',
    raw:        alerta,
  };
};

export default function Alerts() {
  const { selectedBank } = useBank();

  const [alertsData,   setAlertsData]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState(null);
  const [exportOpen,   setExportOpen]   = useState(false);
  const [previewData,  setPreviewData]  = useState(null);
  const [filterLevel,  setFilterLevel]  = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    setLoading(true);
    const qs = selectedBank && selectedBank !== 'all'
      ? `?banco=${encodeURIComponent(selectedBank)}`
      : '';
    fetch(`http://localhost:5000/api/alertas${qs}`)
      .then(res => res.json())
      .then(data => setAlertsData((data || []).map(normalizeAlert)))
      .catch(err => console.error('Error al traer alertas:', err))
      .finally(() => setLoading(false));
  }, [selectedBank]);

  const filteredAlerts = useMemo(() => {
    return alertsData.filter(a => {
      const okLvl = filterLevel  === 'all' || a.alertLevel === filterLevel;
      const okSt  = filterStatus === 'all' || a.status     === filterStatus;
      return okLvl && okSt;
    });
  }, [alertsData, filterLevel, filterStatus]);

  // Contadores sobre TODAS las alertas (no filtradas) para que los chips muestren totales reales
  const crit = alertsData.filter(t => t.alertLevel === 'critical').length;
  const high = alertsData.filter(t => t.alertLevel === 'high').length;
  const med  = alertsData.filter(t => t.alertLevel === 'medium').length;
  const low  = alertsData.filter(t => t.alertLevel === 'low').length;
  const blk  = alertsData.filter(t => t.status === 'blocked').length;
  const flg  = alertsData.filter(t => t.status === 'flagged').length;

  const exportCSV = () => {
    const header = 'ID,Fecha,Usuario,Banco,Tipo,Monto,Riesgo,Nivel,Estado\n';
    const rows   = filteredAlerts.map(t =>
      `${t.id},${new Date(t.timestamp).toLocaleString('es-CO')},${t.user},${t.bank.name},${t.type},${t.amount},${t.riskScore},${t.alertLevel},${t.status}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = `alertas_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const header = 'ALERTAS TRIDA\n' + '='.repeat(60) + '\n\n';
    const rows   = filteredAlerts.slice(0, 50).map(t =>
      `${t.id} | ${new Date(t.timestamp).toLocaleString('es-CO')} | ${t.user} | ${t.bank.name} | ${fmtCOP(t.amount)} | Riesgo: ${t.riskScore}% (${t.alertLevel}) | ${t.status}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = `alertas_${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const showPreview = (format) => {
    setPreviewData({ format, count: filteredAlerts.length, sample: filteredAlerts.slice(0, 5) });
  };

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
              <ShieldX size={16}/><div><span className="al-sv">{crit}</span><span className="al-sl">Críticas</span></div>
              {crit > 0 && <Zap size={12} className="al-blink"/>}
            </div>
            <div className="al-sc al-high">
              <ShieldAlert size={16}/><div><span className="al-sv">{high}</span><span className="al-sl">Altas</span></div>
            </div>
            <div className="al-sc al-blk">
              <span className="al-sv">{blk}</span><span className="al-sl">Bloqueadas</span>
            </div>
          </div>
          <div className="al-actions">
            <button className="al-exp-btn" onClick={() => setExportOpen(!exportOpen)}>
              <Download size={14} /> Exportar
            </button>
            {exportOpen && (
              <div className="al-exp-dd">
                <button onClick={() => showPreview('csv')}><FileSpreadsheet size={13}/> Vista CSV <Eye size={11}/></button>
                <button onClick={() => showPreview('pdf')}><FileText size={13}/> Vista PDF <Eye size={11}/></button>
                <button onClick={() => { exportCSV(); setExportOpen(false); }}><FileSpreadsheet size={13}/> Descargar CSV</button>
                <button onClick={() => { exportPDF(); setExportOpen(false); }}><FileText size={13}/> Descargar PDF</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Barra de filtros ── */}
      <div className="al-filters">
        <div className="al-filt-group">
          <span className="al-filt-lbl">Nivel:</span>
          <button className={`al-chip ${filterLevel === 'all' ? 'on' : ''}`}
                  onClick={() => setFilterLevel('all')}>
            Todas <em>{alertsData.length}</em>
          </button>
          <button className={`al-chip ${filterLevel === 'critical' ? 'on' : ''}`}
                  onClick={() => setFilterLevel('critical')}
                  style={filterLevel === 'critical' ? { background: `${RC.critical}22`, color: RC.critical, borderColor: RC.critical } : {}}>
            Críticas <em>{crit}</em>
          </button>
          <button className={`al-chip ${filterLevel === 'high' ? 'on' : ''}`}
                  onClick={() => setFilterLevel('high')}
                  style={filterLevel === 'high' ? { background: `${RC.high}22`, color: RC.high, borderColor: RC.high } : {}}>
            Altas <em>{high}</em>
          </button>
          <button className={`al-chip ${filterLevel === 'medium' ? 'on' : ''}`}
                  onClick={() => setFilterLevel('medium')}
                  style={filterLevel === 'medium' ? { background: `${RC.medium}22`, color: RC.medium, borderColor: RC.medium } : {}}>
            Medias <em>{med}</em>
          </button>
          <button className={`al-chip ${filterLevel === 'low' ? 'on' : ''}`}
                  onClick={() => setFilterLevel('low')}
                  style={filterLevel === 'low' ? { background: `${RC.low}22`, color: RC.low, borderColor: RC.low } : {}}>
            Bajas <em>{low}</em>
          </button>
        </div>

        <div className="al-filt-group">
          <span className="al-filt-lbl">Estado:</span>
          <button className={`al-chip ${filterStatus === 'all' ? 'on' : ''}`}
                  onClick={() => setFilterStatus('all')}>
            Todas
          </button>
          <button className={`al-chip ${filterStatus === 'blocked' ? 'on' : ''}`}
                  onClick={() => setFilterStatus('blocked')}>
            🚫 Bloqueadas <em>{blk}</em>
          </button>
          <button className={`al-chip ${filterStatus === 'flagged' ? 'on' : ''}`}
                  onClick={() => setFilterStatus('flagged')}>
            ⚠️ Marcadas <em>{flg}</em>
          </button>
        </div>

        {(filterLevel !== 'all' || filterStatus !== 'all') && (
          <button className="al-clear" onClick={() => { setFilterLevel('all'); setFilterStatus('all'); }}>
            <X size={12}/> Limpiar filtros
          </button>
        )}
      </div>

      <div className="al-body">
        <div className={`al-list ${selected ? 'al-list-shrink' : ''}`}>
          {loading ? (
            <p style={{ color: 'var(--text-tertiary)', padding: '20px' }}>Consultando alertas...</p>
          ) : filteredAlerts.length === 0 ? (
            alertsData.length === 0 ? (
              <div className="al-empty">
                <CheckCircle size={48} color="#34D399"/>
                <h3>Sin alertas activas</h3>
                <p>El sistema no ha detectado transacciones sospechosas recientes.</p>
              </div>
            ) : (
              <div className="al-empty">
                <CheckCircle size={48} color="#FBBF24"/>
                <h3>Sin resultados</h3>
                <p>No hay alertas que coincidan con los filtros seleccionados.</p>
                <button className="al-clear" onClick={() => { setFilterLevel('all'); setFilterStatus('all'); }} style={{ marginTop: 10 }}>
                  <X size={12}/> Limpiar filtros
                </button>
              </div>
            )
          ) : (
            filteredAlerts.slice(0, 100).map((t, i) => (
              <div
                key={`${t.id}-${i}`}
                className={`al-card al-${t.alertLevel} ${selected?.id === t.id ? 'al-card-sel' : ''}`}
                style={{ animationDelay: `${i * 0.03}s` }}
                onClick={() => setSelected(t)}
              >
                <div className="al-cl">
                  <div className="al-ci" style={{ background: `${RC[t.alertLevel]}15`, color: RC[t.alertLevel] }}>
                    {t.alertLevel === 'critical' ? <ShieldX size={18}/> : <ShieldAlert size={18}/>}
                  </div>
                  <div className="al-info">
                    <div className="al-top">
                      <span className="al-id">{t.id}</span>
                      <span className={`al-lvl al-lvl-${t.alertLevel}`}>{ALERT_LEVELS[t.alertLevel].label}</span>
                      <span className={`al-st al-st-${t.status}`}>{t.status === 'blocked' ? '🚫 Bloqueada' : '⚠️ Marcada'}</span>
                      <span className="al-time">{new Date(t.timestamp).toLocaleTimeString('es-CO')}</span>
                    </div>
                    <div className="al-det">
                      <span><strong>{t.user}</strong></span><span>·</span>
                      <span style={{ color: t.bank.color }}>{t.bank.name}</span><span>·</span>
                      <span className="mono">{fmtCOP(t.amount)}</span><span>·</span>
                      <span>{t.location.city}</span>
                    </div>
                  </div>
                </div>
                <div className="al-cr">
                  <svg viewBox="0 0 36 36" className="al-ring">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={RC[t.alertLevel]} strokeWidth="3" strokeDasharray={`${t.riskScore}, 100`} strokeLinecap="round"/>
                    <text x="18" y="20.35" textAnchor="middle" fill={RC[t.alertLevel]} fontSize="9" fontWeight="700">{t.riskScore}%</text>
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>

        {selected && (
          <div className="al-detail-panel">
            <div className="adp-header">
              <h3>Detalle de Alerta</h3>
              <button className="adp-close" onClick={() => setSelected(null)}><X size={16}/></button>
            </div>
            <div className="adp-body">
              <div className="adp-row adp-id-row">
                <span className="adp-id">{selected.id}</span>
                <span className="adp-level" style={{ color: RC[selected.alertLevel], background: `${RC[selected.alertLevel]}15` }}>
                  {ALERT_LEVELS[selected.alertLevel].label}
                </span>
              </div>
              <div className="adp-divider"/>
              <div className="adp-grid">
                <div className="adp-field"><span className="adp-lbl">Usuario</span><span className="adp-val">{selected.user}</span></div>
                <div className="adp-field"><span className="adp-lbl">Cuenta</span><span className="adp-val mono">{selected.account}</span></div>
                <div className="adp-field"><span className="adp-lbl">Banco</span><span className="adp-val" style={{ color: selected.bank.color }}>{selected.bank.name}</span></div>
                <div className="adp-field"><span className="adp-lbl">Tipo</span><span className="adp-val">{selected.type}</span></div>
                <div className="adp-field"><span className="adp-lbl">Monto</span><span className="adp-val adp-amount">{fmtCOP(selected.amount)}</span></div>
                <div className="adp-field"><span className="adp-lbl">Riesgo</span><span className="adp-val" style={{ color: RC[selected.alertLevel], fontWeight: 800 }}>{selected.riskScore}%</span></div>
                <div className="adp-field"><span className="adp-lbl">Ciudad</span><span className="adp-val">{selected.location.city}</span></div>
                <div className="adp-field"><span className="adp-lbl">Canal</span><span className="adp-val">{selected.channel}</span></div>
                <div className="adp-field"><span className="adp-lbl">Dispositivo</span><span className="adp-val">{selected.device.type}</span></div>
                <div className="adp-field"><span className="adp-lbl">Estado</span><span className={`adp-val stb st-${selected.status}`}>{selected.status === 'blocked' ? '🚫 Bloqueada' : selected.status === 'flagged' ? '⚠️ Marcada' : '✅ Aprobada'}</span></div>
                <div className="adp-field"><span className="adp-lbl">¿Fraude?</span><span className="adp-val" style={{ color: selected.isFraud ? '#EF4444' : '#34D399' }}>{selected.isFraud ? 'Sí' : 'No'}</span></div>
                <div className="adp-field"><span className="adp-lbl">Fecha</span><span className="adp-val">{new Date(selected.timestamp).toLocaleString('es-CO')}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {previewData && (
        <div className="al-preview-modal" onClick={() => setPreviewData(null)}>
          <div className="al-preview-card" onClick={e => e.stopPropagation()}>
            <div className="apm-header">
              <h3><Eye size={15}/> Vista Previa — {previewData.format.toUpperCase()}</h3>
              <button onClick={() => setPreviewData(null)}><X size={16}/></button>
            </div>
            <div className="apm-body">
              <p className="apm-count">{previewData.count} alertas a exportar</p>
              <div className="apm-table">
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
            <div className="apm-footer">
              <button className="apm-cancel" onClick={() => setPreviewData(null)}>Cancelar</button>
              <button className="apm-download" onClick={() => {
                previewData.format === 'csv' ? exportCSV() : exportPDF();
                setPreviewData(null); setExportOpen(false);
              }}>
                <Download size={14}/> Descargar {previewData.format.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}