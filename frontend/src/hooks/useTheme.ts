import { useContext } from "react";
import { ThemeContext, ThemeContextType } from "@/context/ThemeContext";

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe ser utilizado dentro de un ThemeProvider");
  }
  return context;
}
