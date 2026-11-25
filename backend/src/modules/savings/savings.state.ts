import { Prisma } from "@prisma/client";

export type SavingsState = "ACTIVA" | "PAUSADA" | "COMPLETADA" | "CANCELADA";

export function deriveSavingsState(
  montoActual: Prisma.Decimal,
  montoObjetivo: Prisma.Decimal,
  existingState: SavingsState,
  requestedState?: SavingsState,
): SavingsState {
  if (requestedState === "COMPLETADA") {
    return "COMPLETADA";
  }

  if (requestedState === "PAUSADA" || requestedState === "CANCELADA") {
    return requestedState;
  }

  if (
    requestedState === undefined &&
    (existingState === "PAUSADA" || existingState === "CANCELADA")
  ) {
    return existingState;
  }

  return montoActual.greaterThanOrEqualTo(montoObjetivo)
    ? "COMPLETADA"
    : "ACTIVA";
}
