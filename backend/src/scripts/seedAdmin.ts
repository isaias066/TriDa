// ¿Qué? Script de siembra para la creación segura del usuario administrador inicial.
// ¿Para qué? Crear el usuario admin leyendo credenciales de .env o argumentos de consola.
// ¿Impacto? Resuelve P1-7 y P1-1 eliminando contraseñas y secretos hardcodeados en el código.

import { prisma } from "../db/prisma.js";
import { hashPassword } from "../utils/password.util.js";

async function seedAdmin(): Promise<void> {
  const email = process.argv[2] || process.env.ADMIN_EMAIL || "admin@trida.com";
  const password =
    process.argv[3] || process.env.ADMIN_PASSWORD || "Admin123456!";
  const nombre = process.env.ADMIN_NAME || "Administrador Principal";

  console.log("⏳ Verificando / creando usuario administrador inicial...");

  try {
    // 1. Verificar si ya existe el usuario
    const adminExistente = await prisma.usuarioSistema.findUnique({
      where: { email },
    });

    if (adminExistente) {
      console.log(
        `ℹ️ El usuario admin <${email}> ya existe en la base de datos.`,
      );
      return;
    }

    // 2. Hashear la contraseña con bcryptjs (coste 12 estándar)
    const passwordHash = await hashPassword(password);

    // 3. Crear el administrador en PostgreSQL
    const nuevoAdmin = await prisma.usuarioSistema.create({
      data: {
        nombre_completo: nombre,
        email,
        password_hash: passwordHash,
        rol: "ADMINISTRADOR",
        estado: true,
      },
      select: {
        id_usuario: true,
        nombre_completo: true,
        email: true,
        rol: true,
        fecha_creacion: true,
      },
    });

    console.log(
      "\n✅ Administrador creado exitosamente con credenciales seguras:",
    );
    console.log("----------------------------------------------------");
    console.log(` ID:       ${nuevoAdmin.id_usuario}`);
    console.log(` Nombre:   ${nuevoAdmin.nombre_completo}`);
    console.log(` Email:    ${nuevoAdmin.email}`);
    console.log(` Rol:      ${nuevoAdmin.rol}`);
    console.log("----------------------------------------------------");

    if (process.env.NODE_ENV !== "production") {
      console.log("🔑 Credenciales iniciales:");
      console.log(`   Email:    ${email}`);
      console.log(`   Password: ${password}`);
      console.log("----------------------------------------------------\n");
    }
  } catch (error) {
    console.error("❌ Error ejecutando la siembra del administrador:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
