// ¿Qué? Script interactivo de siembra para la creación del usuario administrador inicial.
// ¿Para qué? Solicitar interactiva y textualmente en consola los datos (nombre, email, contraseña) del nuevo admin.
// ¿Impacto? Elimina credenciales hardcodeadas (P1-7) y permite crear administradores personalizados de forma segura.

import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { prisma } from '../db/prisma.js';
import { hashPassword } from '../utils/password.util.js';

/**
 * Helper para solicitar un campo por consola y reintentar si no cumple la validación.
 */
async function promptField(
  rl: ReturnType<typeof createInterface>,
  question: string,
  validateFn?: (val: string) => boolean | string,
): Promise<string> {
  while (true) {
    const answer = (await rl.question(question)).trim();
    if (!validateFn) {
      if (answer.length > 0) return answer;
      console.log('  ⚠️ El campo no puede estar vacío. Intente de nuevo.\n');
      continue;
    }
    const validation = validateFn(answer);
    if (validation === true) return answer;
    console.log(`  ⚠️ ${typeof validation === 'string' ? validation : 'Valor inválido. Intente de nuevo.'}\n`);
  }
}

async function seedAdmin() {
  const rl = createInterface({ input, output });

  console.log('\n====================================================');
  console.log('  🔐 CREACIÓN INTERACTIVA DE ADMINISTRADOR (TriDa)');
  console.log('====================================================\n');

  try {
    // 1. Pedir Nombre Completo
    const nombre = await promptField(
      rl,
      '👤 Ingrese el Nombre Completo del administrador: ',
    );

    // 2. Pedir Correo Electrónico con validación de formato
    const email = await promptField(
      rl,
      '📧 Ingrese el Correo Electrónico (ej: admin@trida.co): ',
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Formato de correo electrónico inválido.',
    );

    // 3. Verificar si el correo ya existe en PostgreSQL
    const adminExistente = await prisma.usuarioSistema.findUnique({
      where: { email },
    });

    if (adminExistente) {
      console.log(`\n⚠️ El usuario con correo <${email}> ya existe en la base de datos.`);
      rl.close();
      await prisma.$disconnect();
      process.exit(0);
    }

    // 4. Pedir Contraseña con validación de complejidad (RS-003)
    const password = await promptField(
      rl,
      '🔑 Ingrese la Contraseña (mínimo 10 caracteres, 1 mayúscula, 1 minúscula, 1 número): ',
      (val) => {
        if (val.length < 10) return 'La contraseña debe tener al menos 10 caracteres.';
        if (!/[A-Z]/.test(val)) return 'Debe incluir al menos una letra mayúscula (A-Z).';
        if (!/[a-z]/.test(val)) return 'Debe incluir al menos una letra minúscula (a-z).';
        if (!/[0-9]/.test(val)) return 'Debe incluir al menos un número (0-9).';
        return true;
      },
    );

    rl.close();

    console.log('\n⏳ Procesando y registrando administrador en la base de datos...');

    // 5. Hashear contraseña con bcryptjs (coste 12)
    const passwordHash = await hashPassword(password);

    // 6. Guardar en PostgreSQL
    const nuevoAdmin = await prisma.usuarioSistema.create({
      data: {
        nombre_completo: nombre,
        email,
        password_hash: passwordHash,
        rol: 'ADMINISTRADOR',
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

    console.log('\n====================================================');
    console.log('  ✅ Administrador creado exitosamente');
    console.log('====================================================');
    console.log(` ID:       ${nuevoAdmin.id_usuario}`);
    console.log(` Nombre:   ${nuevoAdmin.nombre_completo}`);
    console.log(` Email:    ${nuevoAdmin.email}`);
    console.log(` Rol:      ${nuevoAdmin.rol}`);
    console.log('====================================================');
    console.log('🔑 Credenciales configuradas para iniciar sesión:');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: (la contraseña ingresada)`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ Error ejecutando la siembra del administrador:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

seedAdmin();