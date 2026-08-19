// ¿Qué? Punto de entrada de la aplicación React.
// ¿Para qué? Montar el componente raíz App en el DOM.
// ¿Impacto? Este es el primer archivo que se ejecuta al cargar la aplicación.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Estilos globales (Tailwind + variables CSS)
import './styles/index.css';

// ==============================================================================
// MONTAR LA APLICACIÓN
// ==============================================================================

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'No se encontró el elemento #root en el DOM. ' +
    'Verifica que index.html tenga <div id="root"></div>.'
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);