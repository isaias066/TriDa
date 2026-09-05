/// <reference types="vite/client" />

// Declaración explicita de módulos CSS para silenciar TS2882 en side-effect imports
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module 'leaflet/dist/leaflet.css';
