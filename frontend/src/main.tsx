/**
 * ¿Qué? Punto de entrada principal de React.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "maplibre-gl/dist/maplibre-gl.css";
import "@/styles/index.css";
import "@/styles/animations.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se encontró el elemento #root en el DOM.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
