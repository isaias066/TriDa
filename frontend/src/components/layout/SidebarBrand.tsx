import React from "react";

export const SidebarBrand: React.FC = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
      <img src="/trida-logo.svg" alt="" className="h-10 w-10 rounded-xl" />
      <div className="flex flex-col">
        <span className="text-base font-bold tracking-tight text-text-primary leading-none">
          TriDa
        </span>
        <span className="text-[10px] text-text-muted mt-1 font-medium">
          Asesor & Protección IA
        </span>
      </div>
    </div>
  );
};
