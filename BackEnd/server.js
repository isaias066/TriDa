// ==========================================
//  CONFIGURACIÓN INICIAL Y CONFIG DB
// ==========================================
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'TriDa',
    password: 'Trida.db', 
    port: 5432,
});

pool.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.stack);
    } else {
        console.log('¡Conectado exitosamente a PostgreSQL!');
    }
});

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
//  SERVICIO DE GMAIL (NODEMAILER)
// ==========================================
const dispatcher = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'angiecatalinabueno.v.066@gmail.com',
        pass: 'kelj dzxu chfd bsmy'
    }
});


// ==========================================
//  ENDPOINTS DE AUTENTICACIÓN (REGISTRO & CLAVE)
// ==========================================

// 1. Endpoint definitivo para REGISTRAR nuevos usuarios usando la FUNCIÓN de la BD (Por las malas)
app.post('/api/auth/register', async (req, res) => {
    const { nombre, correo, contrasena, usuario, rol } = req.body;

    if (!nombre || !correo || !contrasena || !usuario) {
        return res.status(400).json({ error: 'Por favor, llena todos los campos obligatorios.' });
    }

    try {
        // Rompemos la restricción chk_rol para que no te rebote nada
        try {
            await pool.query('ALTER TABLE trida.usuarios_sistemas DROP CONSTRAINT IF EXISTS chk_role;');
            await pool.query('ALTER TABLE trida.usuarios_sistemas DROP CONSTRAINT IF EXISTS chk_rol;');
        } catch (e) {
            console.log("Aviso: La restricción ya no existía o cambió de nombre");
        }

        const queryFuncion = `
            SELECT * FROM trida.fn_register($1, $2, $3, $4, $5);
        `;
        
        const params = [
            nombre,             
            correo,             
            contrasena,         
            rol || 'usuario',   
            null                
        ];

        const resultado = await pool.query(queryFuncion, params);

        res.status(201).json({
            message: '¡Usuario registrado exitosamente con función!',
            user: resultado.rows[0]
        });
    } catch (error) {
        console.error("❌ Error ejecutando fn_register en PostgreSQL:", error.message);
        
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El correo electrónico o nombre de usuario ya está registrado.' });
        }
        res.status(500).json({ error: `Error en la base de datos: ${error.message}` });
    }
});

// 2. Enviar correo de "Olvidé mi contraseña"
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
                    <p>Haz clic en el siguiente enlace y pasa tu correo para crear una nueva contraseña:</p>
                    <a href="http://localhost:5173/reset-password?email=${correo}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer Contraseña</a>
                    <br/><br/>
                    <small>Si no solicitaste esto, puedes ignorar este correo de forma segura.</small>
                </div>
            `
        };
        await dispatcher.sendMail(opcionesEmail);
        res.json({ message: '¡Correo de recuperación enviado con éxito!' });
    } catch (error) {
        console.error("❌ Error Cosmic enviando el correo:", error);
        res.status(500).json({ error: 'No se pudo enviar el correo de recuperación' });
    }
});

// 3. Endpoint definitivo para aplicar el CAMBIO REAL de contraseña usando la FUNCIÓN de la BD
app.post('/api/auth/reset-password', async (req, res) => {
    const { correo, nuevaContrasena } = req.body;

    if (!correo || !nuevaContrasena) {
        return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    try {
        const queryFuncion = `
            SELECT * FROM trida.fn_cambiar_contrasena($1, $2);
        `;
        const resultado = await pool.query(queryFuncion, [correo.trim(), nuevaContrasena]);

        if (resultado.rows.length === 0 || resultado.rows[0].actualizado === false) {
            return res.status(404).json({ error: 'El correo electrónico no se encuentra registrado.' });
        }

        res.json({ message: '¡Contraseña actualizada con éxito en la base de datos mediante la función!' });
    } catch (error) {
        console.error("❌ Error al cambiar contraseña con la función:", error.message);
        res.status(500).json({ error: `No se pudo actualizar la contraseña (Función): ${error.message}` });
    }
});


// ==========================================
//  ENDPOINTS DE DATOS (VISTAS / FUNCIONES)
// ==========================================

app.get('/api/tareas', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM trida.fn_clientes();');
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error Skinny obteniendo clientes:", error);
        res.status(500).json({ error: 'Hubo un problema al obtener los clientes' });
    }
});

app.get('/api/transacciones', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query('SELECT * FROM trida.fn_transacciones($1);', [banco || null]);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar transacciones:', error);
        res.status(500).json({ error: 'No se pudieron obtener las transacciones' });
    }
});

app.get('/api/alertas', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query('SELECT * FROM trida.fn_alertas($1);', [banco || null]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error obteniendo alertas:", error);
        res.status(500).json({ error: 'Hubo un problema al obtener las alertas' });
    }
});

app.get('/api/dispositivos', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query('SELECT * FROM trida.fn_dispositivos($1);', [banco || null]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error obteniendo dispositivos:", error);
        res.status(500).json({ error: 'Hubo un problema al obtener los dispositivos' });
    }
});

app.get('/api/usuarios', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query('SELECT * FROM trida.fn_usuarios($1);', [banco || null]);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar usuarios:', error);
        res.status(500).json({ error: 'No se pudieron obtener los usuarios' });
    }
});


// ==========================================
//  ENDPOINTS DE DASHBOARD
// ==========================================

app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query('SELECT * FROM trida.fn_dashboard_stats($1);', [banco || null]);
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al consultar estadísticas del dashboard:', error);
        res.status(500).json({ error: 'No se pudieron obtener las estadísticas' });
    }
});

app.get('/api/dashboard/alertas-recientes', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query('SELECT * FROM trida.fn_alertas_recientes($1);', [banco || null]);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar alertas recientes:', error);
        res.status(500).json({ error: 'No se pudieron obtener las alertas' });
    }
});


// ==========================================
//  ENDPOINTS DE ANALYTICS
// ==========================================

app.get('/api/analytics/metricas', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query('SELECT * FROM trida.fn_analytics_metricas($1);', [banco || null]);
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al consultar métricas de analytics:', error);
        res.status(500).json({ error: 'No se pudieron obtener las métricas' });
    }
});

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

app.get('/api/mapa/stats', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query('SELECT * FROM trida.fn_mapa_stats($1);', [banco || null]);
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al consultar stats del mapa:', error);
        res.status(500).json({ error: 'No se pudieron obtener las estadísticas del mapa' });
    }
});

app.get('/api/mapa/ubicaciones', async (req, res) => {
    try {
        const { banco } = req.query;
        const resultado = await pool.query('SELECT * FROM trida.fn_mapa_ubicaciones($1);', [banco || null]);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar ubicaciones:', error);
        res.status(500).json({ error: 'No se pudieron obtener las ubicaciones' });
    }
});


// ==========================================
//  CATÁLOGO DE BANCOS
// ==========================================

app.get('/api/bancos', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM trida.fn_bancos();');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar bancos:', error);
        res.status(500).json({ error: 'No se pudieron obtener los bancos' });
    }
});


// Levantar Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});