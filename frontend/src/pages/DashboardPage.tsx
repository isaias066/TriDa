// ¿Qué? Página principal del Dashboard del sistema TriDa.
// ¿Para qué? Reemplazar dashboards.jsx con una versión modular que compone
//            StatsCardsGrid, AlertsByLevelRings y RecentAlertsPanel.
// ¿Impacto? Es la primera página que ve el usuario al entrar al sistema.
//           Muestra el estado general de transacciones, alertas y métricas.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Globe, Map } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useDashboardData } from '@hooks/useDashboardData';
import { useAlerts } from '@hooks/useAlerts';
import { useFormattedClock } from '@hooks/useClock';
import { Button } from '@components/ui/Button';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import {
  StatsCardsGrid,
  AlertsByLevelRings,
  RecentAlertsPanel,
} from '@components/dashboard';

// ==============================================================================
// TIPOS
// ==============================================================================

type ViewMode = 'globe' | 'map';

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function DashboardPage() {
  const navigate = useNavigate();
  const { selectedBank, selectedBankInfo } = useBank();
  const { timeWithSeconds } = useFormattedClock();

  // ==============================================================================
  // METADATA
  // ==============================================================================

  useEffect(() => {
    document.title = 'Dashboard — TriDa';
  }, []);

  // ==============================================================================
  // ESTADO LOCAL
  // ==============================================================================

  const [viewMode, setViewMode] = useState<ViewMode>('globe');
  const [isLive, setIsLive] = useState(true);

  // ==============================================================================
  // DATOS — Dashboard stats + alertas recientes (paralelo)
  // ==============================================================================

  const {
    stats,
    recentAlerts,
    loading: dashboardLoading,
    refreshing,
    error: dashboardError,
    lastUpdated,
    refetch: refetchDashboard,
  } = useDashboardData(selectedBank, {
    autoRefresh: isLive,
    autoRefreshMs: 30_000,
  });

  // ==============================================================================
  // DATOS — Conteo de alertas por nivel (para los rings)
  // ==============================================================================

  const {
    counts: alertCounts,
    loading: alertsLoading,
  } = useAlerts(selectedBank);

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleRefresh = async (): Promise<void> => {
    await refetchDashboard();
  };

  const handleToggleView = (): void => {
    setViewMode(prev => prev === 'globe' ? 'map' : 'globe');
  };

  const handleFraudClick = (): void => {
    navigate('/alerts');
  };

  const handleBlockedClick = (): void => {
    navigate('/transactions');
  };

  const handleViewAllAlerts = (): void => {
    navigate('/alerts');
  };

  const handleLevelClick = (level: string): void => {
    navigate(`/alerts?level=${level}`);
  };

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
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '13px',
    color:    'var(--text-secondary)',
    margin:   0,
    display:  'flex',
    alignItems: 'center',
    gap:      '8px',
  };

  const headerRightStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '8px',
    flexWrap:   'wrap',
  };

  const clockStyle: React.CSSProperties = {
    fontSize:           '12px',
    fontWeight:         600,
    color:              'var(--text-tertiary)',
    fontVariantNumeric: 'tabular-nums',
    padding:            '6px 12px',
    background:         'var(--bg-secondary)',
    border:             '1px solid var(--border)',
    borderRadius:       '8px',
  };

  const lastUpdatedStyle: React.CSSProperties = {
    fontSize:   '10px',
    color:      'var(--text-tertiary)',
    fontStyle:  'italic',
  };

  const liveIndicatorStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '6px',
    fontSize:   '10px',
    fontWeight: 700,
    color:      isLive ? '#34D399' : 'var(--text-tertiary)',
    padding:    '6px 12px',
    background: isLive ? 'rgba(52, 211, 153, 0.1)' : 'var(--bg-secondary)',
    border:     `1px solid ${isLive ? 'rgba(52, 211, 153, 0.25)' : 'var(--border)'}`,
    borderRadius: '8px',
    cursor:     'pointer',
    transition: 'all 0.15s ease',
  };

  const liveDotStyle: React.CSSProperties = {
    width:        '6px',
    height:       '6px',
    borderRadius: '50%',
    background:   isLive ? '#34D399' : '#6B7280',
    animation:    isLive ? 'dashboard-live-pulse 2s ease-in-out infinite' : 'none',
  };

  const bottomSectionStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: '280px 1fr',
    gap:                 '20px',
    alignItems:          'start',
  };

  const bottomSectionMobileStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '20px',
  };

  const ringsContainerStyle: React.CSSProperties = {
    background:    'var(--bg-secondary)',
    border:        '1px solid var(--border)',
    borderRadius:  '12px',
    padding:       '20px',
    display:       'flex',
    flexDirection: 'column',
    gap:           '16px',
  };

  const ringsTitleStyle: React.CSSProperties = {
    fontSize:   '13px',
    fontWeight: 700,
    color:      'var(--text-primary)',
    margin:     0,
  };

  // Detectar si la ventana es angosta para responsive
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ==============================================================================
  // RENDER — LOADING
  // ==============================================================================

  if (dashboardLoading && !stats.totalTransactions) {
    return (
      <div style={pageStyle}>
        <Spinner size="lg" label="Cargando dashboard..." centered />
      </div>
    );
  }

  // ==============================================================================
  // RENDER — ERROR
  // ==============================================================================

  if (dashboardError && !stats.totalTransactions) {
    return (
      <div style={pageStyle}>
        <EmptyState
          preset="error"
          description={dashboardError}
          action={
            <Button variant="primary" onClick={handleRefresh}>
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  // ==============================================================================
  // RENDER — DASHBOARD
  // ==============================================================================

  return (
    <div style={pageStyle}>

      {/* ================================================================
          HEADER — Título + controles + reloj
          ================================================================ */}

      <header style={headerStyle}>
        <div style={headerLeftStyle}>
          <h1 style={titleStyle}>Panel de Control</h1>
          <p style={subtitleStyle}>
            Detección de Fraude con IA
            {selectedBankInfo && selectedBankInfo.id !== 'all' && (
              <span style={{ color: selectedBankInfo.color, fontWeight: 600 }}>
                · {selectedBankInfo.name}
              </span>
            )}
          </p>
        </div>

        <div style={headerRightStyle}>
          {/* Reloj */}
          <span style={clockStyle}>{timeWithSeconds}</span>

          {/* Indicador LIVE */}
          <button
            type="button"
            style={liveIndicatorStyle}
            onClick={() => setIsLive(!isLive)}
            aria-label={isLive ? 'Sistema en vivo. Click para pausar' : 'Sistema pausado. Click para reanudar'}
            aria-pressed={isLive}
          >
            <span style={liveDotStyle} />
            {isLive ? 'LIVE' : 'OFF'}
          </button>

          {/* Toggle Globe/Map */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={viewMode === 'globe' ? <Map size={14} /> : <Globe size={14} />}
            onClick={handleToggleView}
          >
            {viewMode === 'globe' ? 'Mapa' : 'Globo'}
          </Button>

          {/* Refresh */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            loading={refreshing}
            onClick={handleRefresh}
          >
            Actualizar
          </Button>

          {/* Info de última actualización */}
          {lastUpdated && (
            <span style={lastUpdatedStyle}>
              Actualizado: {lastUpdated.toLocaleTimeString('es-CO')}
            </span>
          )}
        </div>
      </header>

      {/* ================================================================
          STATS CARDS — 6 métricas principales
          ================================================================ */}

      <StatsCardsGrid
        stats={stats}
        isLive={isLive}
        transactionsPerSecond={isLive ? Math.floor(Math.random() * 8) + 3 : 0}
        onFraudClick={handleFraudClick}
        onBlockedClick={handleBlockedClick}
      />

      {/* ================================================================
          SECCIÓN INFERIOR — Rings + Alertas recientes
          ================================================================ */}

      <div style={isMobile ? bottomSectionMobileStyle : bottomSectionStyle}>
        {/* Columna izquierda: Rings de distribución */}
        <div style={ringsContainerStyle}>
          <h2 style={ringsTitleStyle}>Distribución de alertas</h2>

          {alertsLoading ? (
            <Spinner label="Cargando..." centered />
          ) : (
            <AlertsByLevelRings
              counts={alertCounts}
              onLevelClick={handleLevelClick}
              showTotal
              size="md"
            />
          )}
        </div>

        {/* Columna derecha: Panel de alertas recientes */}
        <RecentAlertsPanel
          alerts={recentAlerts}
          loading={dashboardLoading}
          onViewAll={handleViewAllAlerts}
          isLive={isLive}
          maxItems={15}
        />
      </div>

      {/* Animación global */}
      <style>{`
        @keyframes dashboard-live-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}