const bcrypt = require('bcrypt');

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'TriDa',
    password: '1234',
    port: 5432,
});

(async () => {
    try {
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO trida.usuarios_sistemas
                (nombre_completo, email, password_hash, rol, estado, fecha_creacion)
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING id_usuario, email, rol`,
            ['Admin Principal', 'admin@trida.co', hash, 'ADMINISTRADOR', true]
        );

        console.log('\n✅ Admin creado exitosamente:');
        console.log(result.rows[0]);
        console.log('\n📋 Credenciales para probar el login:');
        console.log('   Email:    admin@trida.co');
        console.log('   Password: admin123');
        console.log('\n');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
    }
})();