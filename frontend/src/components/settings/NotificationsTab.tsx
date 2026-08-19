// ¿Qué? Tab de preferencias de notificaciones en Settings.
// ¿Para qué? Configurar canales y niveles de alertas.
// ¿Impacto? Accesible por todos los roles.

import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Toggle } from '@components/ui/Toggle';

export function NotificationsTab() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [highAlerts, setHighAlerts] = useState(true);
  const [mediumAlerts, setMediumAlerts] = useState(false);
  const [lowAlerts, setLowAlerts] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '560px' }}>
      <Card>
        <CardHeader title="Canales de Notificación" icon={<Bell size={16} />} />
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Toggle label="Email" description="Alertas críticas por correo electrónico" icon={<Mail size={14} />} checked={emailAlerts} onChange={setEmailAlerts} />
            <Toggle label="SMS" description="Alertas por mensaje de texto" icon={<MessageSquare size={14} />} checked={smsAlerts} onChange={setSmsAlerts} />
            <Toggle label="Push In-App" description="Notificaciones en el dashboard" icon={<Smartphone size={14} />} checked={pushAlerts} onChange={setPushAlerts} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Niveles de Alerta" />
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Toggle label="Críticas" description="Transacciones de alto riesgo" checked={criticalAlerts} onChange={setCriticalAlerts} variant="danger" />
            <Toggle label="Altas" description="Transacciones sospechosas" checked={highAlerts} onChange={setHighAlerts} variant="danger" />
            <Toggle label="Medias" description="Actividad inusual" checked={mediumAlerts} onChange={setMediumAlerts} />
            <Toggle label="Bajas" description="Transacciones normales" checked={lowAlerts} onChange={setLowAlerts} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}