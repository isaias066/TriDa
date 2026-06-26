// DB config
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'TriDa',
    password: '1234',
    port: 5432,
});

pool.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.stack);
    } else {
        console.log('¡Conectado exitosamente a PostgreSQL!');
    }
});

// Mostrar en consola al arrancar que los datos cargan bien
const comprobarYMostrarClientes = async () => {
    try {
        const resultadoClientes = await pool.query('SELECT * FROM trida.fn_clientes();');
        console.log('\n-------------------------------------------');
        console.log('Backend tabla clientes en vivo:');
        console.table(resultadoClientes.rows);
        console.log('-------------------------------------------\n');
    } catch (error) {
        console.error('❌ Error al intentar consultar tus clientes reales:', error);
    }
};
comprobarYMostrarClientes();


// ==========================================
//  ENDPOINTS DE LA API (Para el Frontend)
// ==========================================

// revisar en la base de datos antes de levantar este servidor.

// 1. Ruta para obtener Clientes / Usuarios (tabla simple, sin JOIN)
app.get('/api/tareas', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM trida.fn_clientes();');
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error obteniendo clientes:", error);
        res.status(500).json({ error: 'Hubo un problema al obtener los clientes' });
    }
});

// 2. Ruta para obtener Transacciones (con JOIN: cliente, banco, ciudad)
//    Soporta filtro opcional ?banco=codigo
app.get('/api/transacciones', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query(
            'SELECT * FROM trida.fn_transacciones($1);',
            [banco || null]
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar transacciones:', error);
        res.status(500).json({ error: 'No se pudieron obtener las transacciones' });
    }
});

// 3. Ruta para obtener Alertas (con JOIN: cliente, banco, monto, transacción)
// 3. Ruta para obtener Alertas (filtrable por banco)
app.get('/api/alertas', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query(
            'SELECT * FROM trida.fn_alertas($1);',
            [banco || null]
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error obteniendo alertas:", error);
        res.status(500).json({ error: 'Hubo un problema al obtener las alertas' });
    }
});

// 4. Dispositivos (filtrable por banco)
app.get('/api/dispositivos', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query(
            'SELECT * FROM trida.fn_dispositivos($1);',
            [banco || null]
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error obteniendo dispositivos:", error);
        res.status(500).json({ error: 'Hubo un problema al obtener los dispositivos' });
    }
});

// 5. Usuarios/Clientes (filtrable por banco) - ya lo tienes así
app.get('/api/usuarios', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query(
            'SELECT * FROM trida.fn_usuarios($1);',
            [banco || null]
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar usuarios:', error);
        res.status(500).json({ error: 'No se pudieron obtener los usuarios' });
    }
});

// ==========================================
//  SERVICIO DE GMAIL
// ==========================================
const nodemailer = require('nodemailer');
const dispatcher = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'angiecatalinabueno.v.066@gmail.com',
        pass: 'ltjz suks ktke gto'
    }
});

// API de "Olvidé mi contraseña"
app.post('/api/auth/forgot-password', async (req, res) => {
    const { correo } = req.body;
    try {
        const opcionesEmail = {
            from: '"Proyecto Trida" <angiecatalinabueno.v.066@gmail.com>',
            to: correo,
            subject: 'Recuperación de Contraseña - Proyecto Trida',
            html: `
                <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee;">
                    <h2>¿Olvidaste tu contraseña?</h2>
                    <p>Hola, recibimos una solicitud para restablecer la clave de tu cuenta en Proyecto Trida.</p>
                    <p>Haz clic en el siguiente enlace para crear una nueva contraseña. Este enlace expira en 15 minutos:</p>
                    <a href="http://localhost:5173/reset-password?token=TOKEN_SECRETO_TEMPORAL" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer Contraseña</a>
                    <br/><br/>
                    <small>Si no solicitaste esto, puedes ignorar este correo de forma segura.</small>
                </div>
            `
        };
        await dispatcher.sendMail(opcionesEmail);
        res.json({ message: '¡Correo de recuperación enviado con éxito!' });
    } catch (error) {
        console.error("Error enviando el correo:", error);
        res.status(500).json({ error: 'No se pudo enviar el correo de recuperación' });
    }
});


// ==========================================
//  ENDPOINTS DE DASHBOARD
// ==========================================

// 6. Estadísticas agregadas para el Dashboard
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query(
            'SELECT * FROM trida.fn_dashboard_stats($1);',
            [banco || null]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al consultar estadísticas del dashboard:', error);
        res.status(500).json({ error: 'No se pudieron obtener las estadísticas' });
    }
});

// 7. Últimas alertas activas para el Dashboard
app.get('/api/dashboard/alertas-recientes', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query(
            'SELECT * FROM trida.fn_alertas_recientes($1);',
            [banco || null]
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar alertas recientes:', error);
        res.status(500).json({ error: 'No se pudieron obtener las alertas' });
    }
});


// ==========================================
//  ENDPOINTS DE ANALYTICS
// ==========================================

// 8. Métricas de efectividad del modelo
app.get('/api/analytics/metricas', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query(
            'SELECT * FROM trida.fn_analytics_metricas($1);',
            [banco || null]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al consultar métricas de analytics:', error);
        res.status(500).json({ error: 'No se pudieron obtener las métricas' });
    }
});

// 9. Agregaciones para las gráficas de Analytics (tipo, ciudad, canal, banco)
//    Llama a las 4 funciones en paralelo, igual que antes con Promise.all
app.get('/api/analytics/agregaciones', async (req, res) => {
    try {
        const { banco } = req.query;
        const params = [banco || null];
        const [porTipo, porCiudad, porCanal, porBanco] = await Promise.all([
            pool.query('SELECT * FROM trida.fn_analytics_por_tipo($1);', params),
            pool.query('SELECT * FROM trida.fn_analytics_por_ciudad($1);', params),
            pool.query('SELECT * FROM trida.fn_analytics_por_canal($1);', params),
            pool.query('SELECT * FROM trida.fn_analytics_por_banco_fraude($1);', params),
        ]);
        res.json({
            porTipo: porTipo.rows,
            porCiudad: porCiudad.rows,
            porCanal: porCanal.rows,
            porBanco: porBanco.rows,
        });
    } catch (error) {
        console.error('Error al consultar agregaciones:', error);
        res.status(500).json({ error: 'No se pudieron obtener las agregaciones' });
    }
});


// ==========================================
// ENDPOINTS DE MAPA
// ==========================================

// 10. Contadores rápidos para el overlay del mapa global
app.get('/api/mapa/stats', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query(
            'SELECT * FROM trida.fn_mapa_stats($1);',
            [banco || null]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al consultar stats del mapa:', error);
        res.status(500).json({ error: 'No se pudieron obtener las estadísticas del mapa' });
    }
});

// 11. Últimas 50 ubicaciones con su transacción asociada
app.get('/api/mapa/ubicaciones', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query(
            'SELECT * FROM trida.fn_mapa_ubicaciones($1);',
            [banco || null]
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar ubicaciones:', error);
        res.status(500).json({ error: 'No se pudieron obtener las ubicaciones' });
    }
});


// ==========================================
//  CATÁLOGO DE BANCOS
// ==========================================

// 12. Catálogo de bancos activos (para selects/filtros del front)
app.get('/api/bancos', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM trida.fn_bancos();');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar bancos:', error);
        res.status(500).json({ error: 'No se pudieron obtener los bancos' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});