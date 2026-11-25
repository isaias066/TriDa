import { useContext } from "react";
import { AccountContext, AccountContextType } from "@/context/AccountContext";

export function useAccount(): AccountContextType {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error(
      "useAccount debe ser utilizado dentro de un AccountProvider",
    );
  }
  return context;
}
