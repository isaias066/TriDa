// ¿Qué? Contexto de React para gestión global del banco seleccionado y catálogo de bancos.
// ¿Para qué? Centralizar el estado del filtro de banco que afecta a Dashboard,
//            Alerts, Transactions, Map, Analytics y Users.
// ¿Impacto? Cambiar el banco seleccionado dispara re-fetches en todas las páginas
//           que dependen de este filtro global.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getBanks } from '@api/Bancos';
import type { Bank, SelectedBankId } from '@app-types';
import { ALL_BANKS_ID, ALL_BANKS_OPTION } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

/** Valor expuesto por el BankContext. */
export interface BankContextValue {
  banks: Bank[];
  banksWithAll: Bank[];
  selectedBank: SelectedBankId;
  selectedBankInfo: Bank;
  loading: boolean;
  error: string | null;

  setSelectedBank: (bankId: SelectedBankId) => void;
  refreshBanks: () => Promise<void>;
  getBankById: (bankId: string) => Bank | undefined;
}

// ==============================================================================
// CONTEXT
// ==============================================================================

const BankContext = createContext<BankContextValue | null>(null);

// ==============================================================================
// HELPERS INTERNOS
// ==============================================================================

/**
 * Lee el banco seleccionado guardado en localStorage.
 *
 * ¿Qué? Recupera el ID del banco de sesiones anteriores.
 * ¿Para qué? Preservar la elección del usuario entre visitas.
 */
function getStoredSelectedBank(): SelectedBankId {
  try {
    const value = localStorage.getItem('trida-selected-bank');
    return value ?? ALL_BANKS_ID;
  } catch {
    return ALL_BANKS_ID;
  }
}

/**
 * Guarda el banco seleccionado en localStorage.
 */
function storeSelectedBank(bankId: SelectedBankId): void {
  try {
    localStorage.setItem('trida-selected-bank', bankId);
  } catch {
  }
}

// ==============================================================================
// PROVIDER
// ==============================================================================

/**
 * Props del BankProvider.
 */
interface BankProviderProps {
  children: ReactNode;
}

/**
 * Provider del contexto de bancos.
 *
 * ¿Qué? Envuelve la aplicación y provee el catálogo de bancos + banco seleccionado.
 * ¿Para qué? Reemplaza `BankProvider` de `store/context.js` con estructura
 *            propia por archivo y consumo de la nueva capa API.
 * ¿Impacto? Debe montarse en App.tsx envolviendo las rutas protegidas
 *           (después del AuthProvider, ya que ambos son globales).
 *
 */
export function BankProvider({ children }: BankProviderProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBankState] = useState<SelectedBankId>(
    getStoredSelectedBank
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Recarga la lista de bancos desde el backend.
   */
  const refreshBanks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBanks();
      setBanks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error cargando bancos';
      setError(message);
      setBanks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBanks();
  }, [refreshBanks]);

  /**
   * Cambia el banco seleccionado y lo persiste en localStorage.
   */
  const setSelectedBank = useCallback((bankId: SelectedBankId): void => {
    setSelectedBankState(bankId);
    storeSelectedBank(bankId);
  }, []);

  /**
   * Obtiene un banco por su ID.
   */
  const getBankById = useCallback(
    (bankId: string): Bank | undefined => {
      if (bankId === ALL_BANKS_ID) return ALL_BANKS_OPTION;
      return banks.find(bank => bank.id === bankId);
    },
    [banks]
  );

  const banksWithAll = useMemo<Bank[]>(
    () => [ALL_BANKS_OPTION, ...banks],
    [banks]
  );

  const selectedBankInfo = useMemo<Bank>(
    () => getBankById(selectedBank) ?? ALL_BANKS_OPTION,
    [getBankById, selectedBank]
  );

  const value = useMemo<BankContextValue>(
    () => ({
      banks,
      banksWithAll,
      selectedBank,
      selectedBankInfo,
      loading,
      error,
      setSelectedBank,
      refreshBanks,
      getBankById,
    }),
    [
      banks,
      banksWithAll,
      selectedBank,
      selectedBankInfo,
      loading,
      error,
      setSelectedBank,
      refreshBanks,
      getBankById,
    ]
  );

  return (
    <BankContext.Provider value={value}>
      {children}
    </BankContext.Provider>
  );
}

// ==============================================================================
// HOOK
// ==============================================================================

/**
 * Hook para consumir el BankContext.
 *
 * ¿Qué? Retorna el catálogo de bancos y las funciones de gestión.
 * ¿Para qué? Simplificar el consumo desde componentes.
 * ¿Impacto? Lanza error si se usa fuera del BankProvider.
 *
 * @returns Objeto con `banks`, `selectedBank`, `setSelectedBank`, etc.
 * @throws Error si se usa fuera del BankProvider.
 *
 */
export function useBank(): BankContextValue {
  const context = useContext(BankContext);

  if (!context) {
    throw new Error(
      'useBank debe ser usado dentro de un <BankProvider>. ' +
      'Envuelve tu aplicación con <BankProvider> en App.tsx.'
    );
  }

  return context;
}