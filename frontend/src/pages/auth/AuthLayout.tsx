/**
 * ¿Qué? Layout para las pantallas de inicio de sesión y registro.
 * ¿Para qué? Presentar el branding de TriDa con diseño limpio sin hardcoded HEX colors (RC-004).
 */
import React from "react";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  centerHeader?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  centerHeader = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-12"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at top left, rgb(var(--color-primary-rgb) / 0.18), transparent 42%), radial-gradient(ellipse at bottom right, rgb(var(--color-primary-rgb) / 0.12), transparent 38%)",
      }}
    >
      {/* Elementos decorativos sutiles de fondo (orbes de luz sin HEX hardcodeados) */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-saving/10 rounded-full blur-3xl pointer-events-none" />

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={
          theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
        }
        className="absolute right-4 top-4 z-20 rounded-xl border border-border bg-surface/80 p-2.5 text-text-secondary shadow-sm backdrop-blur transition-colors hover:bg-surface-hover hover:text-text-primary"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Header de Marca TriDa */}
        <div className="flex flex-col items-center text-center space-y-2">
          <img
            src="/trida-logo.svg"
            alt=""
            className="h-14 w-14 rounded-2xl shadow-lg shadow-primary/10"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              TriDa
            </h1>
            <p className="text-xs font-medium text-text-secondary mt-0.5">
              Asesor Financiero & Protección Inteligente
            </p>
          </div>
        </div>

        {/* Tarjeta contenedora principal */}
        <Card className="p-6 sm:p-8 backdrop-blur-md bg-surface/90 shadow-2xl border-border">
          <div
            className={`mb-6 space-y-1 ${centerHeader ? "text-center" : ""}`}
          >
            <h2 className="text-xl font-bold text-text-primary">{title}</h2>
            <p className="text-xs text-text-muted">{subtitle}</p>
          </div>

          {children}
        </Card>

        {/* Footer legal estandarizado */}
        <p className="text-center text-[11px] text-text-muted">
          Administra tus finanzas con herramientas de análisis · TriDa ©{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};
