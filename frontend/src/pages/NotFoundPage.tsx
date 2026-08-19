// ¿Qué? Página 404 que se muestra cuando el usuario visita una ruta inexistente.
// ¿Para qué? Ofrecer una experiencia amigable cuando el usuario llega a una URL
//            incorrecta, en lugar de mostrar una pantalla en blanco.
// ¿Impacto? Se accede cuando cualquier ruta no coincide con las definidas en App.tsx.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { EmptyState } from '@components/ui/EmptyState';
import { Button } from '@components/ui/Button';
import {
  PUBLIC_ROUTES,
  DEFAULT_AUTHENTICATED_ROUTE,
} from '@constants/Navigation';

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // ==============================================================================
  // METADATA — Actualizar título del documento
  // ==============================================================================

  useEffect(() => {
    document.title = '404 — Página no encontrada — TriDa';
  }, []);

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  /** Vuelve a la página anterior en el historial. */
  const handleGoBack = (): void => {
    navigate(-1);
  };

  const handleGoHome = (): void => {
    const destination = isAuthenticated
      ? DEFAULT_AUTHENTICATED_ROUTE
      : PUBLIC_ROUTES.LOGIN;
    navigate(destination, { replace: true });
  };

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    minHeight:      '100vh',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '40px 20px',
    background:     'var(--bg-primary)',
    fontFamily:     'Inter, sans-serif',
  };

  const contentStyle: React.CSSProperties = {
    maxWidth:       '520px',
    width:          '100%',
    textAlign:      'center',
  };

  const errorCodeStyle: React.CSSProperties = {
    fontSize:      '96px',
    fontWeight:    900,
    color:         'var(--text-primary)',
    lineHeight:    1,
    margin:        '0 0 8px',
    letterSpacing: '-0.05em',
    opacity:       0.15,
    userSelect:    'none',
  };

  const buttonGroupStyle: React.CSSProperties = {
    display:        'flex',
    gap:            '10px',
    justifyContent: 'center',
    marginTop:      '24px',
    flexWrap:       'wrap',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <main style={wrapperStyle} role="main" aria-label="Página no encontrada">
      <div style={contentStyle}>
        {/* Código de error grande y sutil */}
        <div style={errorCodeStyle} aria-hidden="true">
          404
        </div>

        {/* Empty state con mensaje y descripción */}
        <EmptyState
          icon={<Search size={48} strokeWidth={1.5} />}
          title="Página no encontrada"
          description="La ruta que intentas acceder no existe o ha sido movida. Verifica la URL o vuelve al inicio."
          variant="warning"
          size="lg"
        />

        {/* Grupo de botones de acción */}
        <div style={buttonGroupStyle}>
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft size={16} />}
            onClick={handleGoBack}
          >
            Volver atrás
          </Button>

          <Button
            variant="primary"
            leftIcon={<Home size={16} />}
            onClick={handleGoHome}
          >
            {isAuthenticated ? 'Ir al Dashboard' : 'Ir al inicio de sesión'}
          </Button>
        </div>
      </div>
    </main>
  );
}