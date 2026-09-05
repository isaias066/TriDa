// ¿Qué? Página de solicitud de recuperación de contraseña.
// ¿Para qué? Solicitar enlace de reset con identidad de marca TriDa.
// ¿Impacto? Ruta /forgot-password — logo oficial + formulario.

import { useEffect } from 'react';
import { AuthLayout } from '@components/layout/AuthLayout';
import { ForgotPasswordForm } from '@components/auth/ForgotPasswordForm';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { BRAND_LOGO_SRC, BRAND_NAME } from '@constants/Brand';

export function ForgotPasswordPage() {
  useEffect(() => {
    document.title = 'Recuperar contraseña — TriDa';
  }, []);

  return (
    <AuthLayout>
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <div className="flex w-full flex-col items-center text-center">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[rgba(99,102,241,0.12)] p-2"
              aria-hidden="true"
            >
              <img
                src={BRAND_LOGO_SRC}
                alt={BRAND_NAME}
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            <h1 className="m-0 mb-1.5 text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Recuperar contraseña
            </h1>
            <p className="m-0 max-w-sm text-[13px] leading-relaxed text-[var(--text-secondary)]">
              Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para restablecer tu
              contraseña de forma segura.
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
