/**
 * ¿Qué? Componente completo de la barra lateral (Desktop + Mobile Drawer).
 */
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarAccountSelector } from "./SidebarAccountSelector";
import { SidebarNav } from "./SidebarNav";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { cn } from "@/utils/cn";
import { AlertsApi } from "@/api/Alerts";
import { useAccount } from "@/hooks/useAccount";

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const { pathname } = useLocation();
  const { selectedAccountId } = useAccount();
  const [pendingAlertsCount, setPendingAlertsCount] = useState(0);

  useEffect(() => {
    let active = true;
    const refreshPendingAlerts = () => {
      AlertsApi.getPendingCount(selectedAccountId ?? undefined)
        .then((response) => {
          if (active) {
            setPendingAlertsCount(response.count);
          }
        })
        .catch((error: unknown) => {
          console.error("No se pudo actualizar el contador de alertas", error);
        });
    };
    window.addEventListener("trida-alerts-updated", refreshPendingAlerts);
    refreshPendingAlerts();

    return () => {
      active = false;
      window.removeEventListener("trida-alerts-updated", refreshPendingAlerts);
    };
  }, [pathname, selectedAccountId]);

  return (
    <>
      {/* Overlay Móvil */}
      {isOpenMobile && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Contenedor Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-surface border-r border-border transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        {/* Botón cerrar para móvil */}
        <div className="flex items-center justify-between lg:hidden pr-3">
          <SidebarBrand />
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-md text-text-muted hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand en Desktop */}
        <div className="hidden lg:block">
          <SidebarBrand />
        </div>

        {/* Selector de Cuentas */}
        <SidebarAccountSelector />

        {/* Enlaces de Navegación */}
        <SidebarNav
          onItemClick={onCloseMobile}
          pendingAlertsCount={pendingAlertsCount}
        />

        {/* Pie con Usuario */}
        <SidebarUserProfile />
      </aside>
    </>
  );
};
