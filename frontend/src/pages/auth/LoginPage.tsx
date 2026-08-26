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
  // RENDER
  // ==============================================================================

  return (
    <AuthLayout>
      <Card variant="elevated" padding="lg">
        <CardHeader>
          {/* Contenedor centrado: icono + textos del header */}
          <div className="flex w-full flex-col items-center text-center">
            {/* Logo + brand */}
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(99,102,241,0.15)] text-indigo"
              aria-hidden="true"
            >
              <Shield size={28} strokeWidth={2} />
            </div>

            <h1 className="m-0 mb-1 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              TriDa
            </h1>
            <p className="mb-5 mt-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
              Sistema Antifraude
            </p>

            {/* Título de bienvenida */}
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