// ¿Qué? Página de restablecimiento de contraseña del sistema TriDa.
// ¿Para qué? Reemplazar resetpassword.jsx con una versión modular que solo
//            compone AuthLayout + ResetPasswordForm.
// ¿Impacto? Se accede en /reset-password?token=xxx desde el enlace enviado
//           por email. Toda la lógica de verificación de token y cambio de
//           contraseña está en el sub-componente ResetPasswordForm.

import { useEffect } from 'react';
import { Lock } from 'lucide-react';
import { AuthLayout } from '@components/layout/AuthLayout';
import { ResetPasswordForm } from '@components/auth/ResetPasswordForm';
import { Card, CardHeader, CardBody } from '@components/ui/Card';

// ==============================================================================
// COMPONENTE
// ==============================================================================


export function ResetPasswordPage() {

  // ==============================================================================
  // METADATA — Actualizar título del documento
  // ==============================================================================

  useEffect(() => {
    document.title = 'Nueva contraseña — TriDa';
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
              <Lock size={26} strokeWidth={2} />
            </div>

            {/* Título y descripción */}
            <h1 style={titleStyle}>Crear nueva contraseña</h1>
            <p style={subtitleStyle}>
              Elige una contraseña segura para tu cuenta. Debe cumplir con
              todos los requisitos de seguridad.
            </p>
          </div>
        </CardHeader>

        <CardBody>
          <ResetPasswordForm />
        </CardBody>
      </Card>
    </AuthLayout>
  );
}