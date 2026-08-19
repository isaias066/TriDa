// ¿Qué? Wrapper de rutas que protege el acceso según autenticación, rol y permisos.
// ¿Para qué? Reemplazar el ProtectedRoute.jsx original que solo verificaba admin,
//            y añadir verificaciones granulares por rol y permiso.
// ¿Impacto? Todas las rutas privadas del sistema usan este componente,
//           garantizando seguridad centralizada y cumplimiento de RS-003 (RBAC).

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Shield, ShieldAlert, Lock } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import { Button } from '@components/ui/Button';
import type { SystemRole } from '@constants/Roles';
import type { PermissionKey } from '@constants/Permissions';
import { PUBLIC_ROUTES } from '@constants/Navigation';

// ==============================================================================
// TYPES
// ==============================================================================

export interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  allowedRoles?: SystemRole[];
  requiredPermission?: PermissionKey;
  redirectTo?: string;
  silentRedirect?: boolean;
  unauthorizedRedirect?: string;
}

// ==============================================================================
// COMPONENTE — LoadingScreen
// ==============================================================================

function LoadingScreen() {
  const containerStyle: React.CSSProperties = {
    position:       'fixed',
    top:            0,
    left:           0,
    right:          0,
    bottom:         0,
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '16px',
    background:     'var(--bg-primary)',
    zIndex:         9999,
  };

  const iconWrapperStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '64px',
    height:         '64px',
    borderRadius:   '50%',
    background:     'rgba(99, 102, 241, 0.15)',
    color:          '#6366F1',
    marginBottom:   '8px',
  };

  const messageStyle: React.CSSProperties = {
    fontSize:   '13px',
    color:      'var(--text-secondary)',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    letterSpacing: '0.02em',
  };

  return (
    <div style={containerStyle} role="status" aria-live="polite">
      <div style={iconWrapperStyle}>
        <Shield size={28} strokeWidth={2} />
      </div>
      <Spinner size="md" variant="primary" />
      <p style={messageStyle}>Verificando sesión...</p>
    </div>
  );
}

// ==============================================================================
// COMPONENTE — UnauthorizedScreen
// ==============================================================================

interface UnauthorizedScreenProps {
  reason: 'role' | 'permission';
  redirectPath: string;
}

function UnauthorizedScreen({ reason, redirectPath }: UnauthorizedScreenProps) {
  const containerStyle: React.CSSProperties = {
    minHeight:      '100vh',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '20px',
    background:     'var(--bg-primary)',
  };

  const wrapperStyle: React.CSSProperties = {
    maxWidth:  '480px',
    width:     '100%',
    textAlign: 'center',
  };

  const iconElement = reason === 'role' ? (
    <Lock size={48} strokeWidth={1.5} />
  ) : (
    <ShieldAlert size={48} strokeWidth={1.5} />
  );

  const title = reason === 'role'
    ? 'Acceso restringido por rol'
    : 'Permiso insuficiente';

  const description = reason === 'role'
    ? 'Tu rol actual no tiene acceso a esta sección del sistema. Contacta a un administrador si necesitas acceso.'
    : 'No tienes el permiso específico requerido para acceder a esta funcionalidad.';

  return (
    <div style={containerStyle} role="alert" aria-live="assertive">
      <div style={wrapperStyle}>
        <EmptyState
          icon={iconElement}
          title={title}
          description={description}
          variant="danger"
          size="lg"
          action={
            <Button
              variant="primary"
              onClick={() => (window.location.href = redirectPath)}
            >
              Volver al inicio
            </Button>
          }
        />
      </div>
    </div>
  );
}

// ==============================================================================
// COMPONENTE PRINCIPAL — ProtectedRoute
// ==============================================================================

export function ProtectedRoute({
  children,
  adminOnly = false,
  allowedRoles,
  requiredPermission,
  redirectTo = PUBLIC_ROUTES.LOGIN,
  silentRedirect = false,
  unauthorizedRedirect = '/',
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isAdmin,
    loading,
    user,
    isRole,
    hasPermission,
  } = useAuth();
  const location = useLocation();

  // ==============================================================================
  // 1. VERIFICACIÓN DE CARGA
  // ==============================================================================

  if (loading) {
    return <LoadingScreen />;
  }

  // ==============================================================================
  // 2. VERIFICACIÓN DE AUTENTICACIÓN
  // ==============================================================================

  if (!isAuthenticated) {
    // Guardar la ruta actual para redirigir después del login
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // ==============================================================================
  // 3. VERIFICACIÓN DE ADMIN (adminOnly)
  // ==============================================================================

  if (adminOnly && !isAdmin) {
    if (silentRedirect) {
      return <Navigate to={unauthorizedRedirect} replace />;
    }
    return <UnauthorizedScreen reason="role" redirectPath={unauthorizedRedirect} />;
  }

  // ==============================================================================
  // 4. VERIFICACIÓN DE ROLES PERMITIDOS
  // ==============================================================================

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = user && allowedRoles.some((role) => isRole(role));

    if (!hasAllowedRole) {
      if (silentRedirect) {
        return <Navigate to={unauthorizedRedirect} replace />;
      }
      return <UnauthorizedScreen reason="role" redirectPath={unauthorizedRedirect} />;
    }
  }

  // ==============================================================================
  // 5. VERIFICACIÓN DE PERMISO ESPECÍFICO
  // ==============================================================================

  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (silentRedirect) {
      return <Navigate to={unauthorizedRedirect} replace />;
    }
    return <UnauthorizedScreen reason="permission" redirectPath={unauthorizedRedirect} />;
  }

  // ==============================================================================
  // 6. RENDERIZAR CHILDREN
  // ==============================================================================

  return <>{children}</>;
}