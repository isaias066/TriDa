import '../styles/Analytics.css';

export default function Analytics() {
  return (
    <div className="an-page">
      <div className="an-h">
        <div>
          <h2>Analíticas del Modelo</h2>
          <p>Métricas de efectividad y rendimiento del modelo ML</p>
        </div>
      </div>

      <div className="an-m">
        <div className="mc"><div className="mi"><span className="mv">—</span><span className="ml">Tasa de Detección</span></div></div>
        <div className="mc"><div className="mi"><span className="mv">—</span><span className="ml">Falsos Positivos</span></div></div>
        <div className="mc"><div className="mi"><span className="mv">$0</span><span className="ml">Monto Promedio</span></div></div>
        <div className="mc"><div className="mi"><span className="mv">0</span><span className="ml">Total Analizadas</span></div></div>
      </div>

      <div className="an-g">
        <div className="ac"><h3>Transacciones por Tipo</h3><p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '20px' }}>Sin datos</p></div>
        <div className="ac"><h3>Top Ciudades</h3><p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '20px' }}>Sin datos</p></div>
        <div className="ac"><h3>Canal</h3><p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '20px' }}>Sin datos</p></div>
        <div className="ac"><h3>Fraude por Banco</h3><p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '20px' }}>Sin datos</p></div>
      </div>
    </div>
  );
}
