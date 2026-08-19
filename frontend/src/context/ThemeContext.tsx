// ¿Qué? Contexto de React para gestión del tema visual (dark/light) del sistema.
// ¿Para qué? Centralizar la lógica de tema que estaba en store/context.js,
//            y aplicar la preferencia del sistema del usuario según RD-005.
// ¿Impacto? Consumido por Sidebar, Settings y cualquier componente que necesite
//           adaptarse al tema activo (dashboard, cards, mapas).

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { STORAGE_KEYS } from '@constants/Api';

// ==============================================================================
// TYPES
// ==============================================================================

export type Theme = 'dark' | 'light';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// ==============================================================================
// CONTEXT
// ==============================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ==============================================================================
// HELPERS INTERNOS
// ==============================================================================

/**
 * Detecta la preferencia de tema del sistema operativo del usuario.
 *
 * ¿Qué? Consulta el media query `prefers-color-scheme` del navegador.
 * ¿Para qué? Cumplir RD-005 — usar el tema del sistema como valor inicial.
 * ¿Impacto? Si el usuario tiene el sistema en modo oscuro, la app arranca oscura.
 *
 * @returns 'dark' o 'light' según la preferencia detectada.
 */
function getSystemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Lee el tema guardado en localStorage.
 *
 * ¿Qué? Intenta obtener la preferencia previamente guardada.
 * ¿Para qué? Preservar la elección del usuario entre sesiones.
 * ¿Impacto? Si no hay valor guardado, retorna null (se usa el del sistema).
 */
function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.THEME);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

/**
 * Guarda el tema en localStorage.
 *
 * ¿Qué? Persiste la elección del usuario.
 * ¿Para qué? Recordar la preferencia en la próxima visita.
 */
function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
  }
}

/**
 * Aplica el tema al elemento raíz del documento.
 *
 * ¿Qué? Establece el atributo `data-theme` en `<html>`.
 * ¿Para qué? Permitir que los estilos CSS reaccionen al cambio de tema
 *            usando el selector `[data-theme="dark"]` o `[data-theme="light"]`.
 * ¿Impacto? Cualquier componente puede adaptar sus estilos mediante CSS.
 */
function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

// ==============================================================================
// PROVIDER
// ==============================================================================

/**
 * Props del ThemeProvider.
 */
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
}

/**
 * Provider del contexto de tema.
 *
 * ¿Qué? Envuelve la aplicación y provee el tema activo + funciones de cambio.
 * ¿Para qué? Reemplaza `ThemeProvider` de `store/context.js` con estructura
 *            propia por archivo (patrón moderno) y tipado estricto.
 * ¿Impacto? Debe montarse en App.tsx envolviendo a toda la aplicación.
 *
 */
export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Prioridad: initialTheme (props) > localStorage > sistema
    if (initialTheme) return initialTheme;
    return getStoredTheme() ?? getSystemTheme();
  });

  useEffect(() => {
    storeTheme(theme);
    applyThemeToDocument(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      if (getStoredTheme() === null) {
        setThemeState(event.matches ? 'dark' : 'light');
      }
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () => setThemeState(prev => (prev === 'dark' ? 'light' : 'dark')),
      setTheme:    (newTheme: Theme) => setThemeState(newTheme),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ==============================================================================
// HOOK
// ==============================================================================

/**
 * Hook para consumir el ThemeContext.
 *
 * ¿Qué? Retorna el tema activo y las funciones para cambiarlo.
 * ¿Para qué? Simplificar el consumo desde componentes.
 * ¿Impacto? Lanza error si se usa fuera del ThemeProvider (mejora debugging).
 *
 * @returns Objeto con `theme`, `toggleTheme` y `setTheme`.
 * @throws Error si se usa fuera del ThemeProvider.
 *
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme debe ser usado dentro de un <ThemeProvider>. ' +
      'Envuelve tu aplicación con <ThemeProvider> en App.tsx.'
    );
  }

  return context;
}