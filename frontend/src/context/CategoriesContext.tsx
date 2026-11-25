import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CategoriesApi } from "@/api/Categories";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/Category";

export interface CategoriesContextValue {
  categories: Category[];
  isLoading: boolean;
  ensureCategories: () => Promise<Category[] | null>;
  refreshCategories: () => Promise<void>;
  createCategory: (payload: CreateCategoryPayload) => Promise<Category | null>;
  updateCategory: (
    id: number,
    payload: UpdateCategoryPayload,
  ) => Promise<Category | null>;
  deleteCategory: (id: number) => Promise<boolean>;
}

export const CategoriesContext = createContext<
  CategoriesContextValue | undefined
>(undefined);

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.id_usuario ?? null;

  return (
    <CategoriesState key={userId ?? "anonymous"} userId={userId}>
      {children}
    </CategoriesState>
  );
};

const CategoriesState = ({
  children,
  userId,
}: {
  children: ReactNode;
  userId: number | null;
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const requestId = useRef(0);
  const pendingRequest = useRef<Promise<Category[] | null> | null>(null);
  const hasAttemptedLoad = useRef(false);
  const { showToast } = useToast();

  useEffect(
    () => () => {
      requestId.current += 1;
      pendingRequest.current = null;
    },
    [],
  );

  const loadCategories = useCallback(
    async (force = false): Promise<Category[] | null> => {
      if (userId === null) return null;

      if (force) {
        requestId.current += 1;
        pendingRequest.current = null;
      } else {
        if (hasLoaded) return categories;
        if (pendingRequest.current) return pendingRequest.current;
        if (hasAttemptedLoad.current) return null;
      }

      hasAttemptedLoad.current = true;
      const currentRequestId = ++requestId.current;
      setIsLoading(true);

      const request = (async (): Promise<Category[] | null> => {
        try {
          const result = await CategoriesApi.getAll();
          if (currentRequestId !== requestId.current) return null;
          setCategories(result);
          setHasLoaded(true);
          return result;
        } catch (error) {
          if (currentRequestId !== requestId.current) return null;
          const err = error instanceof Error ? error : new Error(String(error));
          showToast({
            type: "error",
            title: "Error al cargar categorías",
            message: err.message,
          });
          return null;
        } finally {
          if (currentRequestId === requestId.current) setIsLoading(false);
        }
      })();

      pendingRequest.current = request;
      try {
        return await request;
      } finally {
        if (pendingRequest.current === request) {
          pendingRequest.current = null;
        }
      }
    },
    [categories, hasLoaded, showToast, userId],
  );

  const ensureCategories = useCallback(
    () => loadCategories(),
    [loadCategories],
  );

  const refreshCategories = useCallback(async () => {
    await loadCategories(true);
  }, [loadCategories]);

  const createCategory = useCallback(
    async (payload: CreateCategoryPayload): Promise<Category | null> => {
      try {
        const category = await CategoriesApi.create(payload);
        requestId.current += 1;
        pendingRequest.current = null;
        if (hasLoaded) {
          setCategories((current) => [...current, category]);
        } else {
          void loadCategories(true);
        }
        showToast({
          type: "success",
          title: "Categoría creada",
          message: "La categoría se registró correctamente.",
        });
        return category;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        showToast({
          type: "error",
          title: "Error",
          message: err.message || "No se pudo crear la categoría.",
        });
        return null;
      }
    },
    [hasLoaded, loadCategories, showToast],
  );

  const updateCategory = useCallback(
    async (
      id: number,
      payload: UpdateCategoryPayload,
    ): Promise<Category | null> => {
      try {
        const category = await CategoriesApi.update(id, payload);
        requestId.current += 1;
        pendingRequest.current = null;
        if (hasLoaded) {
          setCategories((current) =>
            current.map((item) => (item.id_categoria === id ? category : item)),
          );
        } else {
          void loadCategories(true);
        }
        showToast({
          type: "success",
          title: "Categoría actualizada",
          message: "Los cambios se guardaron correctamente.",
        });
        return category;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        showToast({
          type: "error",
          title: "Error al actualizar categoría",
          message: err.message || "No se pudo actualizar la categoría.",
        });
        return null;
      }
    },
    [hasLoaded, loadCategories, showToast],
  );

  const deleteCategory = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await CategoriesApi.delete(id);
        requestId.current += 1;
        pendingRequest.current = null;
        if (hasLoaded) {
          setCategories((current) =>
            current.filter((category) => category.id_categoria !== id),
          );
        } else {
          void loadCategories(true);
        }
        showToast({
          type: "success",
          title: "Categoría desactivada",
          message: "La categoría ya no aparecerá en tus movimientos nuevos.",
        });
        return true;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        showToast({
          type: "error",
          title: "Error al desactivar categoría",
          message: err.message || "No se pudo desactivar la categoría.",
        });
        return false;
      }
    },
    [hasLoaded, loadCategories, showToast],
  );

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        isLoading,
        ensureCategories,
        refreshCategories,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};
