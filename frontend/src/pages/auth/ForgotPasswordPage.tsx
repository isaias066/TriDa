// ¿Qué? Página de solicitud de recuperación de contraseña del sistema TriDa.
// ¿Para qué? Reemplazar forgotpassword.jsx con una versión modular que solo
//            compone AuthLayout + ForgotPasswordForm.
// ¿Impacto? Se accede en /forgot-password. Toda la lógica de recuperación
//           está en el sub-componente ForgotPasswordForm.

import { useEffect } from 'react';
import { KeyRound } from 'lucide-react';
import { AuthLayout } from '@components/layout/AuthLayout';
import { ForgotPasswordForm } from '@components/auth/ForgotPasswordForm';
import { Card, CardHeader, CardBody } from '@components/ui/Card';

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ForgotPasswordPage() {

  // ==============================================================================
  // METADATA — Actualizar título del documento
  // ==============================================================================

  useEffect(() => {
    document.title = 'Recuperar contraseña — TriDa';
  }, []);

  // ==============================================================================
  // ESTILOS DEL HEADER
  // ==============================================================================

  const iconContainerStyle: React.CSSProperties = {
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

  const titleStyle: React.CSSProperties = {
    fontSize:      '20px',
    fontWeight:    700,
    color:         'var(--text-primary)',
    margin:        '0 0 6px',
    textAlign:     'center',
    letterSpacing: '-0.01em',
  };

  const subtitleStyle: React.CSSProperties = {
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
            {/* Ícono */}
            <div style={iconContainerStyle} aria-hidden="true">
              <KeyRound size={26} strokeWidth={2} />
            </div>

            {/* Título y descripción */}
            <h1 style={titleStyle}>Recuperar contraseña</h1>
            <p style={subtitleStyle}>
              Ingresa el correo asociado a tu cuenta y te enviaremos un enlace
              para restablecer tu contraseña de forma segura.
            </p>
          </div>
        </CardHeader>

        <CardBody>
          <ForgotPasswordForm />
        </CardBody>
      </Card>
    </AuthLayout>
  );
}