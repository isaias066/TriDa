import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Esto activa la extensión necesaria en PostgreSQL
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    console.log('✅ Extensión pg_trgm activada correctamente en la base de datos.');
  } catch (e) {
    console.error('❌ Error al activar la extensión:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();