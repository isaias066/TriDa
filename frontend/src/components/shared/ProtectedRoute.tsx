import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from "@/hooks/useAccount";
import { Button } from "@/components/ui/Button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("USER" | "ADMIN")[];
}

/**
 * Componente Guard para redirigir a /login si no hay sesión activa
 * o a 404/dashboard si no cumple con los roles requeridos.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const {
    accounts,
    isLoading: accountsLoading,
    loadError: accountsError,
    refreshAccounts,
  } = useAccount();
  const location = useLocation();

  // Muestra pantalla de carga mientras se verifica la sesión en el inicio
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm font-medium text-text-secondary">
            Cargando sesión...
          </span>
        </div>
      </div>
    );
  }

  // Redirección al login si no está autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificación opcional de roles (ej. solo ADMIN)
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (accountsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-text-secondary">
        Cargando tus cuentas...
      </div>
    );
  }

  if (accountsError && accounts.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md space-y-4 rounded-2xl border border-border bg-surface p-6 text-center">
          <h1 className="text-lg font-semibold text-text-primary">
            No se pudieron cargar tus cuentas
          </h1>
          <p role="alert" className="text-sm text-text-secondary">
            {accountsError}
          </p>
          <Button type="button" onClick={() => void refreshAccounts()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (accounts.length === 0 && location.pathname !== "/accounts") {
    return <Navigate to="/accounts" replace />;
  }

  return <>{children}</>;
};
