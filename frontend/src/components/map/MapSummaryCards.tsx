import { MapPin, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { MapSummary } from "@/types";

interface MapSummaryCardsProps {
  summary: MapSummary | null;
}

export function MapSummaryCards({ summary }: MapSummaryCardsProps) {
  const totalGeolocalizadas = summary?.total_geolocalizadas ?? 0;
  const transaccionesRiesgo = summary?.transacciones_riesgo_alto ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Ubicaciones registradas */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Ubicaciones registradas
          </p>
          <p className="text-xl font-bold text-[var(--color-text-primary)] mt-1">
            {totalGeolocalizadas}
          </p>
          <span className="text-2xs text-[var(--color-text-muted)]">
            Transacciones con coordenadas
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
          <MapPin className="w-5 h-5" />
        </div>
      </Card>

      {/* Riesgo geográfico */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Riesgo alto
          </p>
          <p className="text-xl font-bold mt-1 text-[var(--color-danger)]">
            {transaccionesRiesgo}
          </p>
          <span className="text-2xs text-[var(--color-text-muted)]">
            Score promedio {summary?.score_promedio ?? 0}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-danger-light)] text-[var(--color-danger)] flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
      </Card>
    </div>
  );
}
