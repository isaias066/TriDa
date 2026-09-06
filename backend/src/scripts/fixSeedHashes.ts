// ¿Qué? Script para actualizar los hashes bcrypt en la BD local activa
// ¿Para qué? Permitir inicio de sesión inmediato con cualquier usuario seed usando 'TriDa2026!'

import { prisma } from "../db/prisma.js";
import { hashPassword } from "../utils/password.util.js";

async function updateAllSeedPasswords(): Promise<void> {
  console.log("⏳ Actualizando contraseñas de usuarios seed...");

  try {
    const defaultPassword = "TriDa2026!";
    const passwordHash = await hashPassword(defaultPassword);

    const result = await prisma.$executeRawUnsafe(
      `UPDATE trida.usuarios_sistemas SET password_hash = $1 WHERE id_usuario <= 201;`,
      passwordHash,
    );

    console.log(`✅ ${result} usuarios seed actualizados exitosamente.`);
    console.log(
      `🔑 Contraseña de prueba para todos los seed: ${defaultPassword}`,
    );
  } catch (error) {
    console.error("❌ Error actualizando usuarios seed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllSeedPasswords();
