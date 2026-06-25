import { useTheme } from '../store/Context';
import { ALERT_LEVELS } from '../data/mockData';
import { Globe } from 'lucide-react';
import '../styles/TransactionMap.css';

const RC = { low: '#30D158', medium: '#FFD60A', high: '#FF9F0A', critical: '#FF453A' };

export default function TransactionMap() {
  const { theme } = useTheme();
  const st = { total: 0, crit: 0, high: 0, app: 0, blk: 0 };

  return (
    <div className="mp">
      <div className="mp-header">
        <div>
          <h1>Mapa Global</h1>
          <p>Transacciones en tiempo real alrededor del mundo</p>
        </div>
        <div className="mp-legend">
          {Object.entries(ALERT_LEVELS).map(([k, v]) => (
            <div key={k} className="mp-leg-item">
              <span className="mp-leg-dot" style={{ background: RC[k], boxShadow: `0 0 8px ${RC[k]}` }}></span>
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mp-map" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme === 'dark' ? 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.08), transparent 70%), #05050a' : 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.06), transparent 70%), #f5f5f7' }}>
        <div style={{ textAlign: 'center', color: 'rgba(99,102,241,0.25)' }}>
          <Globe size={100} color="rgba(99,102,241,0.12)" />
          <p style={{ marginTop: '16px', fontSize: '14px', fontWeight: 600, color: 'var(--text-tertiary)' }}>Mapa sin datos (frontend demo)</p>
        </div>

        <div className="mp-overlay-stats">
          <div className="mp-os"><span className="mp-os-v">{st.total}</span><span className="mp-os-l">Activas</span></div>
          <div className="mp-os"><span className="mp-os-v" style={{ color: '#FF453A' }}>{st.crit}</span><span className="mp-os-l">Críticas</span></div>
          <div className="mp-os"><span className="mp-os-v" style={{ color: '#FF9F0A' }}>{st.high}</span><span className="mp-os-l">Altas</span></div>
          <div className="mp-os"><span className="mp-os-v" style={{ color: '#30D158' }}>{st.app}</span><span className="mp-os-l">Aprobadas</span></div>
        </div>
      </div>
    </div>
  );
}
