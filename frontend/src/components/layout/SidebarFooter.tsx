// ¿Qué? Footer del sidebar con reloj, indicador LIVE, contadores y toggle de tema.
// ¿Para qué? Aislar la parte inferior del sidebar.jsx original con métricas
//            en tiempo real y controles rápidos del sistema.
// ¿Impacto? Se usa dentro del Sidebar. Muestra el estado del sistema en tiempo real.

import { Sun, Moon, Clock } from 'lucide-react';
import { useTheme } from '@context/ThemeContext';
import { useFormattedClock } from '@hooks/useClock';
import { Tooltip } from '@components/ui/Tooltip';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SidebarFooterProps {
  collapsed: boolean;
  isLive: boolean;
  onToggleLive?: () => void;
  totalTransactions?: number;
  transactionsPerSecond?: number;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function SidebarFooter({
  collapsed,
  isLive,
  onToggleLive,
  totalTransactions = 0,
  transactionsPerSecond = 0,
}: SidebarFooterProps) {
  const { theme, toggleTheme } = useTheme();
  const { time } = useFormattedClock({ intervalMs: 1000 });

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    padding:      collapsed ? '10px 8px 12px' : '10px 12px 12px',
    borderTop:    '1px solid var(--border)',
    display:      'flex',
    flexDirection: 'column',
    gap:          '8px',
    fontFamily:   'Inter, sans-serif',
  };

  // ==============================================================================
  // MODO COLAPSADO — Solo íconos
  // ==============================================================================

  if (collapsed) {
    return (
      <div
        className="sidebar-footer sidebar-footer-collapsed"
        style={wrapperStyle}
      >
        {/* Indicador LIVE */}
        <Tooltip
          content={isLive ? 'Sistema en vivo' : 'Sistema pausado'}
          position="right"
        >
          <button
            type="button"
            onClick={onToggleLive}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          '100%',
              padding:        '8px',
              background:     isLive ? 'rgba(52, 211, 153, 0.1)' : 'var(--bg-tertiary)',
              border:         `1px solid ${isLive ? 'rgba(52, 211, 153, 0.25)' : 'var(--border)'}`,
              borderRadius:   '6px',
              cursor:         'pointer',
              transition:     'all 0.15s ease',
            }}
            aria-label={isLive ? 'Sistema en vivo' : 'Sistema pausado'}
          >
            <span
              style={{
                width:        '10px',
                height:       '10px',
                borderRadius: '50%',
                background:   isLive ? '#34D399' : '#6B7280',
                boxShadow:    isLive ? '0 0 0 3px rgba(52, 211, 153, 0.2)' : 'none',
                animation:    isLive ? 'sidebar-footer-pulse 2s ease-in-out infinite' : 'none',
              }}
            />
          </button>
        </Tooltip>

        {/* Toggle de tema */}
        <Tooltip
          content={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          position="right"
        >
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          '100%',
              padding:        '8px',
              background:     'transparent',
              border:         '1px solid var(--border)',
              borderRadius:   '6px',
              color:          'var(--text-tertiary)',
              cursor:         'pointer',
              transition:     'background 0.15s ease, color 0.15s ease',
            }}
            aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </Tooltip>

        <style>{keyframes}</style>
      </div>
    );
  }

  // ==============================================================================
  // MODO EXPANDIDO — Todos los controles
  // ==============================================================================

  const pillsRowStyle: React.CSSProperties = {
    display: 'flex',
    gap:     '6px',
  };

  const clockPillStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '5px',
    padding:    '6px 10px',
    background: 'var(--bg-tertiary)',
    border:     '1px solid var(--border)',
    borderRadius: '20px',
    fontSize:   '11px',
    color:      'var(--text-secondary)',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    flex:       1,
  };

  const livePillStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'center',
    gap:          '6px',
    padding:      '6px 10px',
    background:   isLive ? 'rgba(52, 211, 153, 0.1)' : 'var(--bg-tertiary)',
    border:       `1px solid ${isLive ? 'rgba(52, 211, 153, 0.25)' : 'var(--border)'}`,
    borderRadius: '20px',
    fontSize:     '10px',
    fontWeight:   700,
    color:        isLive ? '#34D399' : 'var(--text-tertiary)',
    letterSpacing: '0.05em',
    cursor:       onToggleLive ? 'pointer' : 'default',
    transition:   'all 0.15s ease',
    outline:      'none',
    fontFamily:   'inherit',
  };

  const liveDotStyle: React.CSSProperties = {
    width:        '6px',
    height:       '6px',
    borderRadius: '50%',
    background:   isLive ? '#34D399' : '#6B7280',
    boxShadow:    isLive ? '0 0 0 3px rgba(52, 211, 153, 0.2)' : 'none',
    animation:    isLive ? 'sidebar-footer-pulse 2s ease-in-out infinite' : 'none',
    flexShrink:   0,
  };

  const statsRowStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        '6px 10px',
    fontSize:       '11px',
    color:          'var(--text-tertiary)',
    fontVariantNumeric: 'tabular-nums',
  };

  const statValueStyle: React.CSSProperties = {
    color:      'var(--text-secondary)',
    fontWeight: 700,
  };

  const themeButtonStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '6px',
    width:          '100%',
    padding:        '7px 12px',
    background:     'transparent',
    border:         '1px solid var(--border)',
    borderRadius:   '6px',
    color:          'var(--text-secondary)',
    fontSize:       '11px',
    fontWeight:     600,
    cursor:         'pointer',
    transition:     'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
    fontFamily:     'inherit',
  };

  // ==============================================================================
  // RENDER — MODO EXPANDIDO
  // ==============================================================================

  return (
    <div className="sidebar-footer" style={wrapperStyle}>
      {/* Fila 1: Reloj + LIVE */}
      <div style={pillsRowStyle}>
        <div style={clockPillStyle}>
          <Clock size={10} strokeWidth={2} />
          <span>{time}</span>
        </div>

        <button
          type="button"
          onClick={onToggleLive}
          style={livePillStyle}
          aria-label={isLive ? 'Sistema en vivo. Click para pausar' : 'Sistema pausado. Click para reanudar'}
          aria-pressed={isLive}
          disabled={!onToggleLive}
        >
          <span style={liveDotStyle} />
          <span>{isLive ? 'LIVE' : 'OFF'}</span>
        </button>
      </div>

      {/* Fila 2: Stats de transacciones */}
      <div style={statsRowStyle}>
        <span>
          <span style={statValueStyle}>{totalTransactions.toLocaleString('es-CO')}</span> TXN
        </span>
        <span>
          <span style={statValueStyle}>{isLive ? transactionsPerSecond : 0}</span>/s
        </span>
      </div>

      {/* Fila 3: Toggle de tema */}
      <button
        type="button"
        onClick={toggleTheme}
        style={themeButtonStyle}
        aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
        }}
      >
        {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
        <span>Tema {theme === 'dark' ? 'claro' : 'oscuro'}</span>
      </button>

      <style>{keyframes}</style>
    </div>
  );
}

// ==============================================================================
// KEYFRAMES
// ==============================================================================

const keyframes = `
  @keyframes sidebar-footer-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.6; transform: scale(1.3); }
  }
`;