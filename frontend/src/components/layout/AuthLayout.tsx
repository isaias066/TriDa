// ¿Qué? Layout compartido para todas las páginas de autenticación (Login, ForgotPassword, ResetPassword).
// ¿Para qué? Reemplazar el markup repetido en las 3 páginas de auth que tenían
//            estructura idéntica (fondo con orbs, grid overlay, theme toggle, contenedor centrado).
// ¿Impacto? Todas las páginas de auth usan este layout, garantizando consistencia
//           visual y comportamiento (fondo, tema toggle, centrado).

import type { ReactNode } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@context/ThemeContext';

// ==============================================================================
// TYPES
// ==============================================================================

export interface AuthLayoutProps {
  children: ReactNode;
  showThemeToggle?: boolean;
  showDecorations?: boolean;
  className?: string;
}

// ==============================================================================
// SUB-COMPONENTE — ThemeToggleButton
// ==============================================================================

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  const buttonStyle: React.CSSProperties = {
    position:       'absolute',
    top:            '20px',
    right:          '20px',
    width:          '40px',
    height:         '40px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    background:     'rgba(255, 255, 255, 0.05)',
    border:         '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius:   '10px',
    color:          'var(--text-secondary)',
    cursor:         'pointer',
    transition:     'background 0.2s ease, transform 0.15s ease',
    zIndex:         10,
    backdropFilter: 'blur(8px)',
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      style={buttonStyle}
      aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
      title={`Tema actual: ${theme === 'dark' ? 'oscuro' : 'claro'}`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

// ==============================================================================
// SUB-COMPONENTE — DecorationLayer
// ==============================================================================


function DecorationLayer() {
  const containerStyle: React.CSSProperties = {
    position:      'absolute',
    top:           0,
    left:          0,
    right:         0,
    bottom:        0,
    overflow:      'hidden',
    pointerEvents: 'none',
    zIndex:        0,
  };

  // Orbs decorativos con blur
  const orbBaseStyle: React.CSSProperties = {
    position:      'absolute',
    borderRadius:  '50%',
    filter:        'blur(80px)',
    opacity:       0.4,
  };

  const orb1Style: React.CSSProperties = {
    ...orbBaseStyle,
    width:      '400px',
    height:     '400px',
    background: '#6366F1',
    top:        '-100px',
    left:       '-100px',
    animation:  'orb-float-1 20s ease-in-out infinite',
  };

  const orb2Style: React.CSSProperties = {
    ...orbBaseStyle,
    width:      '350px',
    height:     '350px',
    background: '#EC4899',
    bottom:     '-80px',
    right:      '-80px',
    animation:  'orb-float-2 25s ease-in-out infinite',
  };

  const orb3Style: React.CSSProperties = {
    ...orbBaseStyle,
    width:      '300px',
    height:     '300px',
    background: '#06B6D4',
    top:        '40%',
    left:       '50%',
    transform:  'translate(-50%, -50%)',
    animation:  'orb-float-3 18s ease-in-out infinite',
    opacity:    0.25,
  };

  const gridStyle: React.CSSProperties = {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    bottom:          0,
    backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
    backgroundSize:  '40px 40px',
    opacity:         0.5,
  };

  return (
    <div style={containerStyle} aria-hidden="true">
      <div style={orb1Style} />
      <div style={orb2Style} />
      <div style={orb3Style} />
      <div style={gridStyle} />

      <style>{`
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(60px, 40px) scale(1.1); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-50px, -30px) scale(0.9); }
        }
        @keyframes orb-float-3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50%      { transform: translate(-45%, -55%) scale(1.15); }
        }
      `}</style>
    </div>
  );
}

// ==============================================================================
// COMPONENTE PRINCIPAL — AuthLayout
// ==============================================================================

export function AuthLayout({
  children,
  showThemeToggle = true,
  showDecorations = true,
  className = '',
}: AuthLayoutProps) {

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    position:       'relative',
    minHeight:      '100vh',
    width:          '100%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '20px',
    background:     'var(--bg-primary)',
    fontFamily:     'Inter, sans-serif',
    overflow:       'hidden',
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex:   1,
    width:    '100%',
    maxWidth: '440px',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`auth-layout ${className}`}
      style={wrapperStyle}
      role="main"
    >
      {showDecorations && <DecorationLayer />}
      {showThemeToggle && <ThemeToggleButton />}

      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
}