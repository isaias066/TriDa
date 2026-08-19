// ¿Qué? Tab de configuración del modelo de IA en Settings.
// ¿Para qué? Permitir al administrador ajustar umbrales y sensibilidad del modelo.
// ¿Impacto? Solo accesible por ADMINISTRADOR.

import { useState } from 'react';
import { Brain } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Toggle } from '@components/ui/Toggle';

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ModelTab() {
  const [autoBlock, setAutoBlock] = useState(true);
  const [autoBlockThreshold, setAutoBlockThreshold] = useState(90);
  const [sensitivity, setSensitivity] = useState(70);
  const [realtimeAnalysis, setRealtimeAnalysis] = useState(true);
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);

  const rangeRowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '16px', padding: '12px 0',
  };
  const rangeLabelStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '2px', flex: 1,
  };
  const rangeNameStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' };
  const rangeDescStyle: React.CSSProperties = { fontSize: '11px', color: 'var(--text-tertiary)' };
  const rangeValueStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', width: '50px', textAlign: 'right' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
      {/* Umbrales */}
      <Card>
        <CardHeader title="Umbrales de Riesgo" icon={<Brain size={16} />} />
        <CardBody>
          {[
            { label: 'Bajo', range: '0-27%', color: '#34D399', width: '28%' },
            { label: 'Medio', range: '28-59%', color: '#FBBF24', width: '32%' },
            { label: 'Alto', range: '60-79%', color: '#F97316', width: '20%' },
            { label: 'Crítico', range: '80-100%', color: '#EF4444', width: '20%' },
          ].map(level => (
            <div key={level.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', width: '70px' }}>{level.label}</span>
              <div style={{ flex: 1, height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: level.width, height: '100%', background: level.color, borderRadius: '4px' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', width: '55px', textAlign: 'right' }}>{level.range}</span>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Configuración general */}
      <Card>
        <CardHeader title="Configuración del Modelo" />
        <CardBody>
          <Toggle label="Bloqueo automático" description={`Bloquear TXN con riesgo > ${autoBlockThreshold}%`} checked={autoBlock} onChange={setAutoBlock} />

          <div style={rangeRowStyle}>
            <div style={rangeLabelStyle}>
              <span style={rangeNameStyle}>Umbral de auto-bloqueo</span>
              <span style={rangeDescStyle}>Porcentaje para bloquear automáticamente</span>
            </div>
            <input type="range" min="50" max="100" value={autoBlockThreshold} onChange={e => setAutoBlockThreshold(+e.target.value)} style={{ width: '120px' }} />
            <span style={rangeValueStyle}>{autoBlockThreshold}%</span>
          </div>

          <div style={rangeRowStyle}>
            <div style={rangeLabelStyle}>
              <span style={rangeNameStyle}>Sensibilidad del modelo</span>
              <span style={rangeDescStyle}>Mayor sensibilidad = más alertas</span>
            </div>
            <input type="range" min="0" max="100" value={sensitivity} onChange={e => setSensitivity(+e.target.value)} style={{ width: '120px' }} />
            <span style={rangeValueStyle}>{sensitivity}%</span>
          </div>

          <Toggle label="Análisis en tiempo real" description="Procesar transacciones en tiempo real" checked={realtimeAnalysis} onChange={setRealtimeAnalysis} />
          <Toggle label="Whitelist" description="Excluir usuarios/bancos de confianza" checked={whitelistEnabled} onChange={setWhitelistEnabled} />
        </CardBody>
      </Card>
    </div>
  );
}