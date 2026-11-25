/**
 * ¿Qué? Lista de enlaces de navegación de la barra lateral.
 */
import React from "react";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "@/constants/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

interface SidebarNavProps {
  onItemClick?: () => void;
  pendingAlertsCount?: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  onItemClick,
  pendingAlertsCount = 0,
}) => {
  const { user } = useAuth();

  const filteredItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.rol);
  });

  return (
    <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
      <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-wider text-text-muted uppercase">
        Navegación
      </div>

      {filteredItems.map((item) => {
        const Icon = item.icon;
        const hasBadge =
          item.badgeKey === "pendingAlerts" && pendingAlertsCount > 0;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-contrast shadow-sm shadow-primary/20 font-semibold"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover",
              )
            }
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>{item.label}</span>
            </div>

            {hasBadge && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-expense text-white animate-pulse">
                {pendingAlertsCount}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
