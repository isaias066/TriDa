// ¿Qué? Funciones para el manejo seguro de contraseñas usando bcryptjs.
// ¿Para qué? Centralizar el hashing y la verificación sin dependencias nativas de C++.
// ¿Impacto? Evita fallos de compilación en Windows y garantiza el cumplimiento de RS-003.
import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 12;
export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};
export const verifyPassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};
//# sourceMappingURL=password.util.js.map