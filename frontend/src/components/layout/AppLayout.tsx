/**
 * ¿Qué? Layout envolvente principal para las rutas protegidas.
 * ¿Para qué? Integrar la Sidebar, la barra superior móvil y renderizar el contenido con <Outlet />.
 */
import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NAV_ITEMS } from "@/constants/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { registerCurrentDevice } from "@/utils/deviceRegistration";
import { cn } from "@/utils/cn";

const MOBILE_NAV_PATHS = [
  "/dashboard",
  "/transactions",
  "/accounts",
  "/budgets",
  "/map",
];

const CurrentDeviceRegistration: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id_usuario;

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    let active = true;
    registerCurrentDevice(userId).catch((error: unknown) => {
      console.error("No se pudo registrar el dispositivo actual", error);
      if (active) {
        showToast({
          type: "error",
          title: "Dispositivo no registrado",
          message:
            error instanceof Error
              ? error.message
              : "No se pudo vincular este dispositivo a tu cuenta.",
        });
      }
    });

    return () => {
      active = false;
    };
  }, [isAuthenticated, showToast, userId]);

  return null;
};

export const AppLayout: React.FC = () => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const mobileNavItems = NAV_ITEMS.filter(
    (item) =>
      MOBILE_NAV_PATHS.includes(item.path) &&
      (!item.roles || (user && item.roles.includes(user.rol))),
  );

  // Obtiene el título de la vista actual según la ruta
  const currentNavItem = NAV_ITEMS.find(
    (item) => item.path === location.pathname,
  );
  const pageTitle = currentNavItem ? currentNavItem.label : "TriDa";

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <CurrentDeviceRegistration />
      {/* Sidebar Lateral */}
      <Sidebar
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Superior Móvil */}
        <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border lg:hidden shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOpenMobile(true)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-text-primary">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
            <img src="/trida-logo.svg" alt="" className="h-5 w-5 rounded" />
            <span>TriDa</span>
          </div>
        </header>

        {/* Zona de scroll principal (<Outlet /> renderiza las páginas hijas) */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
          <Outlet />
        </main>
        <nav
          aria-label="Navegación principal móvil"
          className="grid grid-cols-5 border-t border-border bg-surface px-1 pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                aria-label={item.label}
                className={({ isActive }) =>
                  cn(
                    "flex min-w-0 flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-text-muted hover:text-text-primary",
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="w-full truncate text-center">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
