import React, { Component } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error("ErrorBoundary caught a render error", {
      errorName: error.name,
    });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main
        role="alert"
        className="grid min-h-dvh place-items-center bg-background p-6 text-center"
      >
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-text-primary">
            Algo salió mal
          </h1>
          <p className="text-sm text-text-secondary">
            Ocurrió un error inesperado al mostrar esta pantalla. Puedes volver
            a cargar la aplicación para intentarlo de nuevo.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast hover:opacity-90"
          >
            Recargar aplicación
          </button>
        </div>
      </main>
    );
  }
}
