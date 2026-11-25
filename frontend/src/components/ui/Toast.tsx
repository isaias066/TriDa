/**
 * ¿Qué? Sistema global de notificaciones Flotantes (Toast Provider + Hook).
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const removeToast = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    },
    [],
  );

  const showToast = useCallback(
    ({ type, title, message }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      const timer = setTimeout(() => {
        timers.current.delete(id);
        removeToast(id);
      }, 4000);
      timers.current.set(id, timer);
    },
    [removeToast],
  );

  const contextValue = useMemo(
    () => ({ showToast, removeToast }),
    [removeToast, showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Contenedor de flotantes */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }
  return context;
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({
  toast,
  onClose,
}) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-income" />,
    error: <AlertCircle className="w-5 h-5 text-expense" />,
    warning: <AlertTriangle className="w-5 h-5 text-budget-warn" />,
    info: <Info className="w-5 h-5 text-saving" />,
  };

  const borders = {
    success: "border-income/30 bg-surface",
    error: "border-expense/30 bg-surface",
    warning: "border-budget-warn/30 bg-surface",
    info: "border-saving/30 bg-surface",
  };

  return (
    <div
      role="status"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-slide-up",
        borders[toast.type],
      )}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-text-primary">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="mt-0.5 text-xs text-text-secondary">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="shrink-0 text-text-muted hover:text-text-primary p-0.5 rounded-md"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
