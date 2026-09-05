// ¿Qué? Página de inicio de sesión TriDa.
// ¿Para qué? Entrada al sistema con marca visual (logo oficial).
// ¿Impacto? Ruta /login — AuthLayout + LoginForm.

import { useEffect } from 'react';
import { AuthLayout } from '@components/layout/AuthLayout';
import { LoginForm } from '@components/auth/LoginForm';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { BRAND_LOGO_SRC, BRAND_NAME, BRAND_TAGLINE_ES } from '@constants/Brand';

export function LoginPage() {
  useEffect(() => {
    document.title = 'Iniciar sesión — TriDa';
  }, []);

  return (
    <AuthLayout>
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <div className="flex w-full flex-col items-center text-center">
            {/* Logo de marca */}
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

            <h1 className="m-0 mb-1 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {BRAND_NAME}
            </h1>
            <p className="mb-5 mt-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
              {BRAND_TAGLINE_ES}
            </p>

            <h2 className="m-0 mb-1.5 text-lg font-bold text-[var(--text-primary)]">
              Bienvenido de nuevo
            </h2>
            <p className="m-0 text-[13px] leading-relaxed text-[var(--text-secondary)]">
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
