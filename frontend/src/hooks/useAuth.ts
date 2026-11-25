import { useContext } from "react";
import { AuthContext, AuthContextType } from "@/context/AuthContext";

/**
 * Hook para acceder fácilmente al estado global de autenticación.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}
