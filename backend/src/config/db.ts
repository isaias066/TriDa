import { Pool } from 'pg';
import { CONFIG } from './env';

const pool = new Pool(CONFIG.DB);

pool.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.stack);
    } else {
        console.log('¡Conectado exitosamente a PostgreSQL!');
    }
});

export default pool;

