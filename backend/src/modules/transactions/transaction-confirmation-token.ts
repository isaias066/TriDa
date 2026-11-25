import jwt, { type JwtPayload } from "jsonwebtoken";

export const TRANSACTION_CONFIRMATION_PURPOSE = "transaction_confirmation";
export const TRANSACTION_CONFIRMATION_TTL_SECONDS = 15 * 60;

export interface TransactionConfirmationClaims {
  id_usuario: number;
  id_transaccion: number;
}

export const createTransactionConfirmationToken = (
  claims: TransactionConfirmationClaims,
  secret: string,
): string =>
  jwt.sign(
    { ...claims, purpose: TRANSACTION_CONFIRMATION_PURPOSE },
    secret,
    {
      expiresIn: TRANSACTION_CONFIRMATION_TTL_SECONDS,
      algorithm: "HS256",
    },
  );

export const verifyTransactionConfirmationToken = (
  token: string,
  secret: string,
): TransactionConfirmationClaims | null => {
  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as JwtPayload;
    if (
      payload.purpose !== TRANSACTION_CONFIRMATION_PURPOSE ||
      typeof payload.id_usuario !== "number" ||
      !Number.isSafeInteger(payload.id_usuario) ||
      payload.id_usuario <= 0 ||
      typeof payload.id_transaccion !== "number" ||
      !Number.isSafeInteger(payload.id_transaccion) ||
      payload.id_transaccion <= 0
    ) {
      return null;
    }
    return {
      id_usuario: payload.id_usuario,
      id_transaccion: payload.id_transaccion,
    };
  } catch {
    return null;
  }
};
