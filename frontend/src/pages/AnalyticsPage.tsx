// ¿Qué? Página de analíticas y métricas del modelo de IA del sistema TriDa.
// ¿Para qué? Reemplazar analytics.jsx con una versión modular que usa
//            useAnalyticsData hook y AggregationChart reutilizable.
// ¿Impacto? Se accede en /analytics. Los analistas pueden evaluar la efectividad
//           del modelo IA, tasas de detección, falsos positivos y distribuciones.

import { useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useAnalyticsData } from '@hooks/useAnalyticsData';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import { Button } from '@components/ui/Button';
import { ScoreRing } from '@components/shared/ScoreRing';
import { AggregationChart } from '@components/analytics/AggregationChart';
import { formatCurrency, formatNumber, formatPercent } from '@utils/Formatters';

// ==============================================================================
// HELPERS
// ==============================================================================

/** Emoji por canal de transacción. */
const CHANNEL_ICONS: Record<string, string> = {
  mobile: '📱',
  web:    '💻',
  pos:    '💳',
  atm:    '🏧',
  branch: '🏦',
};

function getChannelIcon(channel: string): string {
  return CHANNEL_ICONS[channel?.toLowerCase()] ?? '📊';
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function AnalyticsPage() {
  const { selectedBank } = useBank();

  // ==============================================================================
  // METADATA
  // ==============================================================================

  useEffect(() => {
    document.title = 'Analíticas — TriDa';
  }, []);

  // ==============================================================================
  // DATOS
  // ==============================================================================

  const {
    metrics,
    typesRanked,
    topCities,
    channelsRanked,
    topBanksByFraud,
    loading,
    error,
    lastUpdated,
    refetch,
  } = useAnalyticsData(selectedBank, {
    topCitiesLimit: 12,
    topBanksLimit:  10,
  });

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const pageStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '20px',
    padding:       '24px',
    minHeight:     '100vh',
    fontFamily:    'Inter, sans-serif',
  };

  const headerStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    gap:            '16px',
    flexWrap:       'wrap',
  };

  const headerLeftStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '4px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize:      '24px',
    fontWeight:    800,
    color:         'var(--text-primary)',
    margin:        0,
    letterSpacing: '-0.02em',
    display:       'flex',
    alignItems:    'center',
    gap:           '10px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '13px',
    color:    'var(--text-secondary)',
    margin:   0,
  };

  const lastUpdatedStyle: React.CSSProperties = {
    fontSize:  '10px',
    color:     'var(--text-tertiary)',
    fontStyle: 'italic',
  };

  const metricsGridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap:                 '16px',
  };

  const metricCardStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    gap:            '16px',
    padding:        '20px',
    background:     'var(--bg-secondary)',
    border:         '1px solid var(--border)',
    borderRadius:   '12px',
  };

  const metricInfoStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '4px',
    flex:          1,
    minWidth:      0,
  };

  const metricValueStyle: React.CSSProperties = {
    fontSize:           '20px',
    fontWeight:         800,
    color:              'var(--text-primary)',
    letterSpacing:      '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  };

  const metricLabelStyle: React.CSSProperties = {
    fontSize:      '11px',
    fontWeight:    500,
    color:         'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const chartsGridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap:                 '16px',
  };

  // ==============================================================================
  // RENDER — LOADING
  // ==============================================================================

  if (loading) {
    return (
      <div style={pageStyle}>
        <Spinner size="lg" label="Cargando analíticas del modelo..." centered />
      </div>
    );
  }

  // ==============================================================================
  // RENDER — ERROR
  // ==============================================================================

  if (error) {
    return (
      <div style={pageStyle}>
        <EmptyState
          preset="error"
          description={error}
          action={
            <Button variant="primary" onClick={refetch}>
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  // ==============================================================================
  // RENDER — PÁGINA
  // ==============================================================================

  return (
    <div style={pageStyle}>

      {/* ================================================================
          HEADER
          ================================================================ */}

      <header style={headerStyle}>
        <div style={headerLeftStyle}>
          <h1 style={titleStyle}>
            <BarChart3 size={24} />
            Analíticas del Modelo
          </h1>
          <p style={subtitleStyle}>
            Métricas de efectividad y rendimiento del modelo de IA
          </p>
        </div>

        {lastUpdated && (
          <span style={lastUpdatedStyle}>
            Actualizado: {lastUpdated.toLocaleTimeString('es-CO')}
          </span>
        )}
      </header>

      {/* ================================================================
          MÉTRICAS DEL MODELO — 4 cards con ScoreRings
          ================================================================ */}

      <section aria-label="Métricas del modelo de IA">
        <div style={metricsGridStyle}>

          {/* Tasa de detección */}
          <div style={metricCardStyle}>
            <ScoreRing
              score={metrics.detectionRate}
              size="md"
              color="#34D399"
              scoreFormat="compact"
            />
            <div style={metricInfoStyle}>
              <span style={metricValueStyle}>
                {formatPercent(metrics.detectionRate)}
              </span>
              <span style={metricLabelStyle}>Tasa de Detección</span>
            </div>
          </div>

          {/* Falsos positivos */}
          <div style={metricCardStyle}>
            <ScoreRing
              score={metrics.falsePositiveRate}
              size="md"
              color="#FBBF24"
              scoreFormat="compact"
            />
            <div style={metricInfoStyle}>
              <span style={metricValueStyle}>
                {formatPercent(metrics.falsePositiveRate)}
              </span>
              <span style={metricLabelStyle}>Falsos Positivos</span>
            </div>
          </div>

          {/* Monto promedio */}
          <div style={metricCardStyle}>
            <div style={metricInfoStyle}>
              <span style={metricValueStyle}>
                {formatCurrency(metrics.averageAmount)}
              </span>
              <span style={metricLabelStyle}>Monto Promedio</span>
            </div>
          </div>

          {/* Total analizadas */}
          <div style={metricCardStyle}>
            <div style={metricInfoStyle}>
              <span style={metricValueStyle}>
                {formatNumber(metrics.totalAnalyzed)}
              </span>
              <span style={metricLabelStyle}>Total Analizadas</span>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================
          GRÁFICOS DE AGREGACIONES — 4 charts
          ================================================================ */}

      <section aria-label="Distribución de transacciones">
        <div style={chartsGridStyle}>

          {/* Por tipo de transacción */}
          <AggregationChart
            title="Transacciones por Tipo"
            data={typesRanked.map(t => ({
              label: t.type,
              count: t.count,
              fraud: t.fraud,
            }))}
            showFraudColumn
          />

          {/* Top ciudades */}
          <AggregationChart
            title="Top Ciudades"
            data={topCities.map(c => ({
              label: c.city,
              count: c.transactionCount,
            }))}
            barColor="#06B6D4"
            maxItems={12}
          />

          {/* Por canal */}
          <AggregationChart
            title="Canal"
            data={channelsRanked.map(c => ({
              label: c.channel,
              count: c.count,
              icon:  getChannelIcon(c.channel),
            }))}
            barColor="#818CF8"
          />

          {/* Fraude por banco */}
          <AggregationChart
            title="Fraude por Banco"
            data={topBanksByFraud.map(b => ({
              label: b.bank,
              count: b.count,
              fraud: b.fraud,
              color: b.color,
            }))}
            showFraudColumn
          />

        </div>
      </section>
    </div>
  );
}