// ¿Qué? Tab de configuración general del sistema en Settings.
// ¿Para qué? Permitir cambiar el tema visual del dashboard.
// ¿Impacto? Accesible por todos los roles.

import { Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from '@context/ThemeContext';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Button } from '@components/ui/Button';

export function SystemTab() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ maxWidth: '560px' }}>
      <Card>
        <CardHeader title="Sistema" icon={<Settings size={16} />} />
        <CardBody>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Configuración general del frontend.
          </p>

          <Button
            variant="secondary"
            leftIcon={theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            onClick={toggleTheme}
          >
            Cambiar a tema {theme === 'dark' ? 'claro' : 'oscuro'}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}