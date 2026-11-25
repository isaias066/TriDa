import React from "react";
import { Device } from "@/types/Device";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/Formatters";
import {
  Smartphone,
  Monitor,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Trash2,
} from "lucide-react";

interface DeviceCardProps {
  device: Device;
  onToggleTrust: (id: number, confiable: boolean) => void;
  onDelete: (id: number) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onToggleTrust,
  onDelete,
}) => {
  const isMobile =
    device.tipo_dispositivo.toLowerCase().includes("mobile") ||
    device.tipo_dispositivo.toLowerCase().includes("celular") ||
    device.tipo_dispositivo.toLowerCase().includes("smartphone");

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl p-5 shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[var(--color-bg-surface-hover)] border border-[var(--color-border-subtle)] text-[var(--color-primary-500)]">
              {isMobile ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                {device.tipo_dispositivo}
              </h3>
              <p className="text-xs text-[var(--color-text-subtle)] font-mono">
                {device.identificador_unico}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium ${
              device.confiable
                ? "bg-income/10 text-income border-income/20"
                : "bg-budget-warn/10 text-budget-warn border-budget-warn/20"
            }`}
          >
            {device.confiable ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" /> Confiable
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" /> No Confiable
              </>
            )}
          </span>
        </div>

        <div className="space-y-1.5 py-3 border-y border-[var(--color-border-subtle)] my-3 text-xs text-[var(--color-text-subtle)]">
          {device.sistema_operativo && (
            <div className="flex items-center justify-between">
              <span>Sistema Operativo:</span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {device.sistema_operativo}
              </span>
            </div>
          )}
          {device.navegador && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />{" "}
                Navegador:
              </span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {device.navegador}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Primer uso:</span>
            <span className="font-mono text-[var(--color-text-primary)]">
              {formatDate(device.fecha_primer_uso)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Último uso:</span>
            <span className="font-mono text-[var(--color-text-primary)]">
              {formatDate(device.fecha_ultimo_uso)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleTrust(device.id_dispositivo, device.confiable)}
          className="text-xs"
        >
          {device.confiable ? "Marcar No Confiable" : "Marcar Confiable"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(device.id_dispositivo)}
          className="text-[var(--color-text-muted)] hover:text-expense p-2"
          title="Desvincular dispositivo"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
