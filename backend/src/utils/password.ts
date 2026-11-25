// ¿Qué? Funciones para el manejo seguro de contraseñas usando bcryptjs.
// ¿Para qué? Centralizar el hashing y la verificación sin dependencias nativas de C++.
// ¿Impacto? Evita fallos de compilación en Windows y garantiza el cumplimiento de RS-003.

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
