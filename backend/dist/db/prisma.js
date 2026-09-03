// ¿Qué? Instancia Singleton del cliente Prisma ORM.
// ¿Para qué? Centralizar la conexión a PostgreSQL y evitar abrir múltiples conexiones en modo desarrollo.
// ¿Impacto? Previene la caída de la base de datos por el agotamiento del pool de conexiones.
import { PrismaClient } from '@prisma/client';
import { config } from '../config.js';
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: config.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
};
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (config.NODE_ENV !== 'production')
    globalThis.prismaGlobal = prisma;
//# sourceMappingURL=prisma.js.map