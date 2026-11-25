import { useContext, useEffect } from "react";
import {
  CategoriesContext,
  type CategoriesContextValue,
} from "@/context/CategoriesContext";

interface UseCategoriesOptions {
  enabled?: boolean;
}

export const useCategories = (
  options: UseCategoriesOptions = {},
): CategoriesContextValue => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories debe usarse dentro de CategoriesProvider");
  }

  const enabled = options.enabled ?? true;
  const ensureCategories = context.ensureCategories;
  useEffect(() => {
    if (enabled) {
      void ensureCategories();
    }
  }, [ensureCategories, enabled]);

  return context;
};
