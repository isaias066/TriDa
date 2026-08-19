import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'TriDa',
  password: process.env.DB_PASSWORD || '1234',
  port: Number(process.env.DB_PORT) || 5432,
});

async function crearUsuario() {
  try {
    const password = 'user123';
    const hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO trida.usuarios_sistemas
          (nombre_completo, email, password_hash, rol, estado, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id_usuario, email, rol`,
      ['Usuario Analista', 'usuario@trida.co', hash, 'ANALISTA', true]
    );

    console.log('\n✅ Usuario creado exitosamente:');
    console.log(result.rows[0]);
    console.log('\n📋 Credenciales para probar el login:');
    console.log('   Email:    usuario@trida.co');
    console.log('   Password: user123');
    console.log('\n');
  } catch (err: any) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

crearUsuario();

