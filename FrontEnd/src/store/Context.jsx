import { createContext, useContext, useState, useEffect } from 'react';

// ============ THEME ============
const ThemeCtx = createContext();

export function ThemeProvider({ children }) {
  // 🟢 SIEMPRE INICIA EN DARK
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    try { localStorage.setItem('trida-theme', theme); } catch {}
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) return { theme: 'dark', toggleTheme: () => {} };
  return ctx;
};

// ============ BANK ============
const BankCtx = createContext();

export function BankProvider({ children }) {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState('all');
  const [loadingBanks, setLoadingBanks] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/bancos')
      .then(res => res.json())
      .then(data => {
        const normalized = data.map(b => ({
          id:    b.codigo_banco ?? b.codigo ?? b.id,
          name:  b.nombre_banco ?? b.nombre ?? b.name,
          color: b.color ?? '#6366F1',
        }));
        setBanks(normalized);
      })
      .catch(err => console.error('Error cargando bancos:', err))
      .finally(() => setLoadingBanks(false));
  }, []);

  return (
    <BankCtx.Provider value={{ banks, selectedBank, setSelectedBank, loadingBanks }}>
      {children}
    </BankCtx.Provider>
  );
}

export const useBank = () => {
  const ctx = useContext(BankCtx);
  if (!ctx) return { banks: [], selectedBank: 'all', setSelectedBank: () => {}, loadingBanks: false };
  return ctx;
};