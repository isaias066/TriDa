import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { createElement, type PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CategoriesProvider } from "@/context/CategoriesContext";
import type { Category } from "@/types/Category";
import { useCategories } from "./useCategories";

const mocks = vi.hoisted(() => ({
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  showToast: vi.fn(),
  userId: 1,
}));

vi.mock("@/api/Categories", () => ({
  CategoriesApi: {
    getAll: mocks.getAll,
    create: mocks.create,
    update: mocks.update,
    delete: mocks.delete,
  },
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ showToast: mocks.showToast }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id_usuario: mocks.userId } }),
}));

const wrapper = ({ children }: PropsWithChildren) =>
  createElement(CategoriesProvider, null, children);

afterEach(() => {
  cleanup();
});

describe("useCategories", () => {
  beforeEach(() => {
    mocks.getAll.mockReset();
    mocks.create.mockReset();
    mocks.update.mockReset();
    mocks.delete.mockReset();
    mocks.showToast.mockReset();
    mocks.userId = 1;
  });

  it("keeps the newest result when category requests finish out of order", async () => {
    const resolvers: Array<(categories: Category[]) => void> = [];
    mocks.getAll.mockImplementation(
      () =>
        new Promise<Category[]>((resolve) => {
          resolvers.push(resolve);
        }),
    );

    const { result } = renderHook(() => useCategories(), { wrapper });
    await waitFor(() => {
      expect(resolvers).toHaveLength(1);
    });

    act(() => {
      void result.current.refreshCategories();
    });
    await waitFor(() => {
      expect(resolvers).toHaveLength(2);
    });

    await act(async () => {
      resolvers[1]([{ id_categoria: 2, nombre: "Nueva", tipo: "GASTO" }]);
    });
    await waitFor(() => {
      expect(result.current.categories[0]?.nombre).toBe("Nueva");
    });

    await act(async () => {
      resolvers[0]([{ id_categoria: 1, nombre: "Antigua", tipo: "GASTO" }]);
    });

    expect(result.current.categories[0]?.nombre).toBe("Nueva");
  });

  it("shares one request across consumers and does not load a closed modal", async () => {
    mocks.getAll.mockResolvedValue([
      { id_categoria: 1, nombre: "Comida", tipo: "GASTO" },
    ]);

    const { rerender } = renderHook(
      ({ enabled }) => useCategories({ enabled }),
      { initialProps: { enabled: false }, wrapper },
    );
    expect(mocks.getAll).not.toHaveBeenCalled();

    rerender({ enabled: true });
    await waitFor(() => {
      expect(mocks.getAll).toHaveBeenCalledTimes(1);
    });
  });

  it("deduplicates simultaneous requests from multiple category consumers", async () => {
    mocks.getAll.mockResolvedValue([
      { id_categoria: 1, nombre: "Comida", tipo: "GASTO" },
    ]);
    renderHook(
      () => {
        useCategories();
        useCategories();
      },
      { wrapper },
    );
    await waitFor(() => {
      expect(mocks.getAll).toHaveBeenCalledTimes(1);
    });
  });

  it("does not retry a failed automatic load until explicitly refreshed", async () => {
    const originalShowToast = mocks.showToast;
    mocks.getAll.mockRejectedValueOnce(new Error("Network unavailable"));

    try {
      const { result, rerender } = renderHook(() => useCategories(), { wrapper });
      await waitFor(() => {
        expect(mocks.getAll).toHaveBeenCalledTimes(1);
        expect(mocks.showToast).toHaveBeenCalledTimes(1);
      });

      mocks.showToast = vi.fn();
      rerender();
      expect(mocks.getAll).toHaveBeenCalledTimes(1);

      mocks.getAll.mockResolvedValue([
        { id_categoria: 1, nombre: "Comida", tipo: "GASTO" },
      ]);
      await act(async () => {
        await result.current.refreshCategories();
      });

      expect(mocks.getAll).toHaveBeenCalledTimes(2);
      expect(result.current.categories).toHaveLength(1);
    } finally {
      mocks.showToast = originalShowToast;
    }
  });

  it("keeps the shared cache scoped to the authenticated user", async () => {
    mocks.getAll
      .mockResolvedValueOnce([
        { id_categoria: 1, nombre: "Personal", tipo: "GASTO" },
      ])
      .mockResolvedValueOnce([
        { id_categoria: 2, nombre: "Otra cuenta", tipo: "GASTO" },
      ]);

    const { result, rerender } = renderHook(() => useCategories(), { wrapper });
    await waitFor(() => {
      expect(result.current.categories[0]?.nombre).toBe("Personal");
    });

    mocks.userId = 2;
    await act(async () => rerender());

    await waitFor(() => {
      expect(result.current.categories[0]?.nombre).toBe("Otra cuenta");
      expect(mocks.getAll).toHaveBeenCalledTimes(2);
    });
  });

  it("updates the shared category cache after a mutation", async () => {
    const existing = {
      id_categoria: 1,
      nombre: "Comida",
      tipo: "GASTO" as const,
    };
    const created = {
      id_categoria: 2,
      nombre: "Transporte",
      tipo: "GASTO" as const,
    };
    mocks.getAll.mockResolvedValue([existing]);
    mocks.create.mockResolvedValue(created);

    const { result } = renderHook(() => useCategories(), { wrapper });
    await waitFor(() => {
      expect(result.current.categories).toEqual([existing]);
    });

    await act(async () => {
      await result.current.createCategory({
        nombre: "Transporte",
        tipo: "GASTO",
      });
    });

    expect(result.current.categories).toEqual([existing, created]);
  });

  it("replaces edited categories and removes deactivated ones from the shared cache", async () => {
    const categories = [
      { id_categoria: 1, nombre: "Comida", tipo: "GASTO" as const },
      { id_categoria: 2, nombre: "Transporte", tipo: "GASTO" as const },
    ];
    const updated = {
      id_categoria: 1,
      nombre: "Alimentación",
      tipo: "GASTO" as const,
    };
    mocks.getAll.mockResolvedValue(categories);
    mocks.update.mockResolvedValue(updated);
    mocks.delete.mockResolvedValue({ id_categoria: 2 });

    const { result } = renderHook(() => useCategories(), { wrapper });
    await waitFor(() => {
      expect(result.current.categories).toEqual(categories);
    });

    await act(async () => {
      await result.current.updateCategory(1, { nombre: "Alimentación" });
    });
    expect(result.current.categories).toEqual([updated, categories[1]]);

    await act(async () => {
      await result.current.deleteCategory(2);
    });
    expect(result.current.categories).toEqual([updated]);
  });
});
