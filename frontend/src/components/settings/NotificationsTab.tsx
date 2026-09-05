// ¿Qué? Tab de preferencias de notificaciones emergentes en Settings.
// ¿Para qué? Controlar qué alertas de riesgo disparan pop-ups en pantalla.
// ¿Impacto? Persiste por usuario y se adapta al rol activo.

import { Bell, RotateCcw, Smartphone } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Toggle } from '@components/ui/Toggle';
import { Button } from '@components/ui/Button';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';
import { useNotificationPrefs } from '@hooks';
import { RISK_COLORS, RISK_LEVELS, RISK_LEVEL_ORDER } from '@constants/Risk';

export function NotificationsTab() {
  const { user } = useAuth();
  const toast = useToast();
  const { prefs, hydrated, setChannel, setLevel, resetToRoleDefaults } = useNotificationPrefs();

  if (!hydrated) {
    return (
      <div className="max-w-xl text-sm text-[var(--text-tertiary)]">Cargando preferencias…</div>
    );
  }

  const handleReset = () => {
    resetToRoleDefaults();
    toast.info('Preferencias restablecidas según tu rol');
  };

  return (
    <div className="flex max-w-xl flex-col gap-4 font-sans">
      <p className="m-0 text-xs text-[var(--text-secondary)]">
        Configuración de avisos emergentes para{' '}
        <span className="font-semibold text-[var(--text-primary)]">
          {user?.nombre ?? 'usuario'}
        </span>
        {user?.rol ? (
          <>
            {' '}
            · rol <span className="font-semibold text-indigo-light">{user.rol}</span>
          </>
        ) : null}
        . Selecciona qué niveles de riesgo generan pop-ups flotantes en tu pantalla en tiempo real.
      </p>

      {/* Control Maestro In-App */}
      <Card>
        <CardHeader title="Notificaciones en pantalla" icon={<Bell size={16} />} />
        <CardBody>
          <div className="flex flex-col gap-3">
            <Toggle
              label="Pop-ups emergentes in-app"
              description="Muestra avisos flotantes en la esquina del sistema cuando se detecten eventos"
              icon={<Smartphone size={14} />}
              checked={prefs.channels.push}
              onChange={(v) => setChannel('push', v)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Filtros por Nivel de Riesgo */}
      <Card>
        <CardHeader title="Filtro de criticidad de alertas" />
        <CardBody>
          <div className="flex flex-col gap-3">
            {RISK_LEVEL_ORDER.map((level) => (
              <div key={level} className="flex flex-col gap-1">
                <Toggle
                  label={`Alertas ${RISK_LEVELS[level].label.toLowerCase()}s`}
                  description={RISK_LEVELS[level].description}
                  checked={prefs.levels[level]}
                  onChange={(v) => setLevel(level, v)}
                />
                <div className="ml-1 flex items-center gap-2 pl-0.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[level] }}
                    aria-hidden
                  />
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    Nivel {RISK_LEVELS[level].label} ({level})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          leftIcon={<RotateCcw size={14} />}
          onClick={handleReset}
        >
          Restablecer según rol
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (!prefs.channels.push) {
              toast.info('Activa los avisos emergentes arriba para probar los pop-ups');
              return;
            }
            toast.error('Transacción sospechosa de prueba detectada');
          }}
        >
          Probar pop-up
        </Button>
      </div>
    </div>
  );
}
