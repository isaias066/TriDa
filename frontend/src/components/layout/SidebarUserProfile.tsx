/**
 * ¿Qué? Sección inferior de la sidebar con datos del usuario y botón de salida.
 */
import React from "react";
import { LogOut, Sun, Moon, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export const SidebarUserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-3 border-t border-border bg-surface/50">
      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface border border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">
              {user?.nombre_completo || "Usuario"}
            </p>
            <p className="text-[10px] text-text-muted truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Cambiar a modo claro"
                : "Cambiar a modo oscuro"
            }
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            title={
              theme === "dark"
                ? "Cambiar a modo claro"
                : "Cambiar a modo oscuro"
            }
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-budget-warn" />
            ) : (
              <Moon className="w-4 h-4 text-primary" />
            )}
          </button>

          <button
            type="button"
            onClick={() => void logout()}
            className="p-1.5 rounded-md text-text-muted hover:text-expense hover:bg-expense/10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
