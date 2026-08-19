// ¿Qué? Página de inicio de sesión del sistema TriDa.
// ¿Para qué? Reemplazar login.jsx con una versión modular que solo compone
//            el AuthLayout + LoginForm (toda la lógica está en los sub-componentes).
// ¿Impacto? Es la puerta de entrada al sistema. Se accede en /login.

import { useEffect } from 'react';
import { AuthLayout } from '@components/layout/AuthLayout';
import { LoginForm } from '@components/auth/LoginForm';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Shield } from 'lucide-react';

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function LoginPage() {

  // ==============================================================================
  // METADATA — Actualizar título del documento
  // ==============================================================================

  useEffect(() => {
    document.title = 'Iniciar sesión — TriDa';
  }, []);

  // ==============================================================================
  // ESTILOS DEL HEADER
  // ==============================================================================

  const logoContainerStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '56px',
    height:         '56px',
    borderRadius:   '50%',
    background:     'rgba(99, 102, 241, 0.15)',
    color:          '#6366F1',
    margin:         '0 auto 16px',
  };

  const brandNameStyle: React.CSSProperties = {
    fontSize:      '24px',
    fontWeight:    800,
    color:         'var(--text-primary)',
    margin:        '0 0 4px',
    letterSpacing: '-0.02em',
    textAlign:     'center',
  };

  const taglineStyle: React.CSSProperties = {
    fontSize:      '11px',
    color:         'var(--text-tertiary)',
    margin:        '0 0 20px',
    textAlign:     'center',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight:    600,
  };

  const welcomeTitleStyle: React.CSSProperties = {
    fontSize:   '18px',
    fontWeight: 700,
    color:      'var(--text-primary)',
    margin:     '0 0 6px',
    textAlign:  'center',
  };

  const welcomeSubtitleStyle: React.CSSProperties = {
    fontSize:   '13px',
    color:      'var(--text-secondary)',
    margin:     0,
    textAlign:  'center',
    lineHeight: 1.5,
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <AuthLayout>
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <div>
            {/* Logo + brand */}
            <div style={logoContainerStyle} aria-hidden="true">
              <Shield size={28} strokeWidth={2} />
            </div>

            <h1 style={brandNameStyle}>TriDa</h1>
            <p style={taglineStyle}>Sistema Antifraude</p>

            {/* Título de bienvenida */}
            <h2 style={welcomeTitleStyle}>Bienvenido de nuevo</h2>
            <p style={welcomeSubtitleStyle}>
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>
        </CardHeader>

        <CardBody>
          <LoginForm />
        </CardBody>
      </Card>
    </AuthLayout>
  );
}