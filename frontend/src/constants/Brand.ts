// ¿Qué? Asset de marca TriDa (logo del producto).
// ¿Para qué? Sidebar, pantallas de auth y futuras plantillas de email (URL pública).
// ¿Impacto? Un solo import; fallback si la imagen no carga.

import brandLogo from '../assets/brand/logo.png';

/** URL resuelta por Vite del logo oficial. */
export const BRAND_LOGO_SRC = brandLogo;

export const BRAND_NAME = 'TriDa';
export const BRAND_TAGLINE = 'Fraud Detection AI';
export const BRAND_TAGLINE_ES = 'Sistema Antifraude';
