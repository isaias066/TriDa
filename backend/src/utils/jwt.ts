// ¿Qué? Utilidad para firmar y verificar tokens JWT.
// ¿Para qué? Aislar la lógica de jsonwebtoken y tipar el payload del usuario autenticado.
// ¿Impacto? Mantiene la autorización stateless y previene el uso de tokens alterados (RS-002, RS-003).

import jwt from "jsonwebtoken";
import { config } from "../config.js";

/** Payload estándar del JWT; el identificador siempre proviene del token verificado. */
export interface JwtPayload {
  id_usuario: number;
  email: string;
  rol: string;
  token_version?: number;
}

export const signToken = (
  payload: JwtPayload,
  expiresIn: string = config.JWT_EXPIRES_IN,
): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    algorithm: "HS256",
  });
};

export const verifyToken = <T = JwtPayload>(token: string): T => {
  return jwt.verify(token, config.JWT_SECRET, { algorithms: ["HS256"] }) as T;
};
