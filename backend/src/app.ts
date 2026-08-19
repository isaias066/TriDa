import express from 'express';
import cors from 'cors';
import { CONFIG } from './config/env';
import pool from './config/db';

// Importación de rutas
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import mapaRoutes from './routes/mapaRoutes';
import entidadesRoutes from './routes/entidadesRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Probar consulta inicial
const comprobarYMostrarClientes = async () => {
    try {
        const resultadoClientes = await pool.query('SELECT * FROM trida.fn_clientes();');
        console.log('\n-------------------------------------------');
        console.log('Backend tabla clientes en vivo:');
        console.table(resultadoClientes.rows);
        console.log('-------------------------------------------\n');
    } catch (error) {
        console.error('Error al intentar consultar tus clientes reales:', error);
    }
};
comprobarYMostrarClientes();

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/mapa', mapaRoutes);
app.use('/api', entidadesRoutes);

// Iniciar servidor
app.listen(CONFIG.PORT, () => {
    console.log(`🚀 Servidor TypeScript corriendo en http://localhost:${CONFIG.PORT}`);
});

