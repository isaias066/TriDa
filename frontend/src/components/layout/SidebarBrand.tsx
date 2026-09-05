// ¿Qué? Cabecera del sidebar: marca TriDa + logo + colapsar.
// ¿Para qué? Identidad visual y toggle del panel lateral.
// ¿Impacto? Logo oficial a la derecha del nombre; colapsado muestra solo el logo.

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Tooltip } from '@components/ui/Tooltip';
import { BRAND_LOGO_SRC, BRAND_NAME, BRAND_TAGLINE } from '@/constants/Brand';
import { cn } from '@utils/cn';

export interface SidebarBrandProps {
  collapsed: boolean;
  onToggle: () => void;
  logoSrc?: string;
  brandName?: string;
  tagline?: string;
}

export function SidebarBrand({
  collapsed,
  onToggle,
  logoSrc = BRAND_LOGO_SRC,
  brandName = BRAND_NAME,
  tagline = BRAND_TAGLINE,
}: SidebarBrandProps) {
  return (
    <div
      className={cn(
        'sidebar-brand relative flex min-h-[68px] items-center border-b border-[var(--border)] font-sans',
        collapsed ? 'justify-center p-3' : 'justify-between gap-2.5 p-4',
      )}
    >
      {/* Expandido: nombre + tagline | logo a la DERECHA del nombre */}
      {!collapsed && (
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="truncate text-base font-extrabold leading-none tracking-tight text-[var(--text-primary)]">
                {brandName}
              </span>
              <img
                src={logoSrc}
                alt=""
                className="h-8 w-8 shrink-0 rounded-lg object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              {tagline}
            </span>
          </div>
        </div>
      )}

      {/* Colapsado: solo logo */}
      {collapsed && (
        <img
          src={logoSrc}
          alt={brandName}
          className="h-7 w-7 shrink-0 rounded-lg object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      <Tooltip
        content={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        position={collapsed ? 'right' : 'bottom'}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          aria-expanded={!collapsed}
          className={cn(
            'flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-tertiary)]',
            'transition-colors duration-150 outline-none',
            'hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] focus-visible:shadow-[var(--focus-ring)]',
            collapsed
              ? 'absolute -bottom-3.5 right-1/2 z-10 h-7 w-7 translate-x-1/2 bg-[var(--bg-secondary)]'
              : 'h-7 w-7 shrink-0 bg-transparent',
          )}
        >
          {collapsed ? (
            <PanelLeftOpen size={14} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={14} aria-hidden="true" />
          )}
        </button>
      </Tooltip>
    </div>
  );
}
