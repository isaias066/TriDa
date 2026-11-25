/**
 * ¿Qué? Página de error 404 para rutas inexistentes.
 */
import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-expense/10 border border-expense/20 flex items-center justify-center text-expense mb-4 animate-bounce motion-reduce:animate-none">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-text-primary">404</h1>
      <h2 className="text-lg font-semibold text-text-secondary mt-1">
        Página no encontrada
      </h2>
      <p className="text-xs text-text-muted max-w-sm mt-2">
        La ruta a la que intentas acceder no existe o fue movida como parte del
        refactor TriDa.
      </p>

      <Link to="/dashboard" className="mt-6">
        <Button variant="primary" icon={<Home className="w-4 h-4" />}>
          Volver al panel principal
        </Button>
      </Link>
    </div>
  );
};
