import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";

interface FeaturePlaceholderPageProps {
  title: string;
  description: string;
}

export const FeaturePlaceholderPage: React.FC<FeaturePlaceholderPageProps> = ({
  title,
  description,
}) => (
  <section className="mx-auto max-w-2xl rounded-xl border border-dashed border-border bg-surface p-8 text-center">
    <Construction className="mx-auto mb-4 h-8 w-8 text-primary" />
    <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
    <p className="mt-2 text-sm text-text-secondary">{description}</p>
    <p className="mt-3 text-xs text-text-muted">
      Esta ruta está preparada, pero no presenta información falsa ni reutiliza
      datos de otra sección.
    </p>
    <Link
      to="/dashboard"
      className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
    >
      <ArrowLeft className="h-4 w-4" />
      Volver al resumen
    </Link>
  </section>
);
