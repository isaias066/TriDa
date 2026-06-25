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
    password: 'Trida.db',  
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
        const resultadoClientes = await pool.query('SELECT * FROM trida.clientes ORDER BY id_cliente ASC;');
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
// 📡 ENDPOINTS DE LA API (Para el Frontend)
// ==========================================

// 1. Ruta para obtener Clientes / Usuarios
app.get('/api/tareas', async (req, res) => {
    try {
        // Consultamos directo al esquema trida
        const resultado = await pool.query('SELECT * FROM trida.clientes ORDER BY id_cliente ASC;');
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error obteniendo clientes:", error);
        res.status(500).json({ error: 'Hubo un problema al obtener los clientes' });
    }
});

// 2. Ruta para obtener Dispositivos
app.get('/api/dispositivos', async (req, res) => {
    try {
        // Reemplaza 'trida.dispositivos' si tu tabla se llama diferente
        const resultado = await pool.query('SELECT * FROM trida.dispositivos;'); 
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error obteniendo dispositivos:", error);
        res.status(500).json({ error: 'Hubo un problema al obtener los dispositivos' });
    }
});

// 3. Ruta para obtener Transacciones
app.get('/api/transacciones', async (req, res) => {
    try {
        // Trae las transacciones para inflar el Dashboard y la tabla de transacciones
        const resultado = await pool.query('SELECT * FROM trida.transacciones ORDER BY id_transaccion DESC;');
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error obteniendo transacciones:", error);
        res.status(500).json({ error: 'Hubo un problema al obtener las transacciones' });
    }
});

// 4. Ruta para obtener Alertas
app.get('/api/alertas', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM trida.alertas ORDER BY id_alerta DESC;');
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error obteniendo alertas:", error);
        res.status(500).json({ error: 'Hubo un problema al obtener las alertas' });
    }
});


// ==========================================
// 📧 SERVICIO DE GMAIL
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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});