import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Usa la configuración de variables de entorno o los valores por defecto de desarrollo
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'TriDa',
  password: process.env.DB_PASSWORD || '1234',
  port: Number(process.env.DB_PORT) || 5432,
});

async function crearAdmin() {
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
  } catch (err: any) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

crearAdmin();

