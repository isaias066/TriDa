/// <reference types="vite/client" />

// ¿Qué? Declara los tipos de las variables de entorno de Vite.
// ¿Para qué? Permite que TypeScript reconozca `import.meta.env.VITE_*`.
// ¿Impacto? Sin esto, TypeScript marcaría error al usar variables de entorno.

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ==============================================================================
// DECLARACIONES DE MÓDULOS CSS
// ==============================================================================

// Permite importar archivos .css como side-effect (import 'xxx.css')
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Declaración específica para Leaflet CSS
declare module 'leaflet/dist/leaflet.css';