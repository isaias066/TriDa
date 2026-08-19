// ¿Qué? Layout principal de la aplicación autenticada con Sidebar + Main content.
// ¿Para qué? Reemplazar el layout.jsx original que usaba useState para cambiar
//            de tab, por un sistema basado en React Router con <Outlet />.
// ¿Impacto? Todas las rutas privadas del sistema se renderizan dentro de este layout.
//           El Sidebar es persistente entre navegaciones (no se remonta).

import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar';

// ==============================================================================
// TYPES
// ==============================================================================

export interface AppLayoutProps {
  showSidebar?: boolean;
  children?: React.ReactNode;
  className?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function AppLayout({
  showSidebar = true,
  children,
  className = '',
}: AppLayoutProps) {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  // ==============================================================================
  // SCROLL AL TOP AL CAMBIAR DE RUTA
  // ==============================================================================

  useEffect(() => {
    // Al cambiar de ruta, hacer scroll al top del contenido principal
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    display:       'flex',
    minHeight:     '100vh',
    background:    'var(--bg-primary)',
    fontFamily:    'Inter, sans-serif',
    color:         'var(--text-primary)',
  };

  const mainStyle: React.CSSProperties = {
    flex:          1,
    minWidth:      0,
    minHeight:     '100vh',
    overflowY:     'auto',
    overflowX:     'hidden',
    position:      'relative',
    display:       'flex',
    flexDirection: 'column',
  };

  const contentStyle: React.CSSProperties = {
    flex:    1,
    display: 'flex',
    flexDirection: 'column',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`app-layout ${className}`}
      style={wrapperStyle}
    >
      {/* Sidebar persistente */}
      {showSidebar && <Sidebar />}

      {/* Main content — renderiza la página actual via Outlet */}
      <main
        ref={mainRef}
        style={mainStyle}
        role="main"
        aria-label="Contenido principal"
      >
        <div style={contentStyle}>
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
}