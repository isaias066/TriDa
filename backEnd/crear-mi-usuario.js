const bcrypt = require('bcrypt');
// Si usas bcryptjs, cambia la línea de arriba por:
// const bcrypt = require('bcryptjs');

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'TriDa',
    password: '1234',   // 👈 Cambia si tu password de Postgres es otra
    port: 5432,
});

// ════════════════════════════════════════════════════
//  DATOS DEL USUARIO A CREAR
// ════════════════════════════════════════════════════
const USUARIO = {
    nombre:   'Angie Catalina Bueno',
    email:    'angiecatalinabueno.v.066@gmail.com',
    password: 'angie123',         // 👈 Cambia si quieres otra contraseña
    rol:      'ADMINISTRADOR',    // 👈 Puedes poner ANALISTA, OPERADOR o AUDITOR
};

(async () => {
    try {
        // Verificar si ya existe
        const existe = await pool.query(
            'SELECT id_usuario FROM trida.usuarios_sistemas WHERE LOWER(email) = LOWER($1)',
            [USUARIO.email]
        );

        if (existe.rows.length > 0) {
            console.log('\n⚠️ Ya existe un usuario con ese email.');
            console.log('   Si quieres recrearlo, primero ejecuta en pgAdmin:');
            console.log(`   DELETE FROM trida.usuarios_sistemas WHERE email = '${USUARIO.email}';\n`);
            return;
        }

        const hash = await bcrypt.hash(USUARIO.password, 12);

        const result = await pool.query(
            `INSERT INTO trida.usuarios_sistemas
                (nombre_completo, email, password_hash, rol, estado, fecha_creacion)
             VALUES ($1, $2, $3, $4, TRUE, NOW())
             RETURNING id_usuario, nombre_completo, email, rol, fecha_creacion`,
            [USUARIO.nombre, USUARIO.email, hash, USUARIO.rol]
        );

        console.log('\n══════════════════════════════════════════════════');
        console.log('✅ USUARIO CREADO EXITOSAMENTE');
        console.log('══════════════════════════════════════════════════');
        console.log(result.rows[0]);
        console.log('\n📋 CREDENCIALES PARA LOGIN:');
        console.log(`   Email:    ${USUARIO.email}`);
        console.log(`   Password: ${USUARIO.password}`);
        console.log(`   Rol:      ${USUARIO.rol}`);
        console.log('══════════════════════════════════════════════════\n');

    } catch (err) {
        console.error('❌ Error creando usuario:');
        console.error('   Código:  ', err.code || 'N/A');
        console.error('   Mensaje: ', err.message);
    } finally {
        await pool.end();
    }
})();