// ¿Qué? Instancia global de Prisma Client.
// ¿Para qué? Proveer acceso único a la BD en toda la aplicación evitando conexiones múltiples.
// ¿Impacto? Alto (utilizado por todos los servicios y middlewares del backend).

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["error", "warn"],
});
