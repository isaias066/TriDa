const express     = require('express');
const { Pool }    = require('pg');
const cors        = require('cors');
const nodemailer  = require('nodemailer');
const bcrypt      = require('bcrypt');
const jwt         = require('jsonwebtoken');

// ════════════════════════════════════════════════════════════
//  CONFIGURACIÓN GLOBAL
// ════════════════════════════════════════════════════════════
const CONFIG = {
    PORT: 5000,
    DB: {
        user:     'postgres',
        host:     'localhost',
        database: 'TriDa',
        password: '1234',
        port:     5432,
    },

    JWT_SECRET:     'trida_super_secret_key_change_me_2025_x9k7m2p4q8w1',
    JWT_EXPIRES_IN: '24h',
    EMAIL: {
        user: 'angiecatalinabueno.v.066@gmail.com',
        pass: 'ltjz suks ktke gto',
    },
    FRONTEND_URL: 'http://localhost:5173',
};

// ════════════════════════════════════════════════════════════
//  EXPRESS
// ════════════════════════════════════════════════════════════
const app = express();
app.use(cors());
app.use(express.json());

// ════════════════════════════════════════════════════════════
//  POSTGRESQL
// ════════════════════════════════════════════════════════════
const pool = new Pool(CONFIG.DB);

pool.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.stack);
    } else {
        console.log('¡Conectado exitosamente a PostgreSQL!');
    }
});

// ════════════════════════════════════════════════════════════
//  EMAIL (Gmail)
// ════════════════════════════════════════════════════════════
const dispatcher = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: CONFIG.EMAIL.user,
        pass: CONFIG.EMAIL.pass,
    }
});

// ════════════════════════════════════════════════════════════
//  TEST DE CONEXIÓN AL ARRANCAR
// ════════════════════════════════════════════════════════════
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

// ════════════════════════════════════════════════════════════
//  MIDDLEWARES DE AUTENTICACIÓN
// ════════════════════════════════════════════════════════════

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer xxx"

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, CONFIG.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = decoded; // { id_usuario, email, rol, ... }
        next();
    });
}


function requireAdmin(req, res, next) {
    if (!req.user || req.user.rol !== 'ADMINISTRADOR') {
        return res.status(403).json({ error: 'Se requieren privilegios de administrador' });
    }
    next();
}


// ════════════════════════════════════════════════════════════
//  ENDPOINTS - CLIENTES / TRANSACCIONES / ALERTAS / DISPOSITIVOS
// ════════════════════════════════════════════════════════════

app.get('/api/tareas', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM trida.fn_clientes();');
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error obteniendo clientes:", error);
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

// ════════════════════════════════════════════════════════════
//  AUTH - LOGIN
// ════════════════════════════════════════════════════════════
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    try {
        // 1. Buscar usuario por email
        const result = await pool.query('SELECT * FROM trida.fn_login($1);', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // 2. Verificar que esté activo
        if (!user.estado) {
            return res.status(403).json({ error: 'Tu cuenta está desactivada. Contacta al administrador.' });
        }

        // 3. Comparar contraseña
        const passwordOK = await bcrypt.compare(password, user.password_hash);

        if (!passwordOK) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 4. Generar JWT
        const token = jwt.sign(
            {
                id_usuario: user.id_usuario,
                email:      user.email,
                rol:        user.rol,
                nombre:     user.nombre_completo,
            },
            CONFIG.JWT_SECRET,
            { expiresIn: CONFIG.JWT_EXPIRES_IN }
        );

        // 5. Actualizar último acceso
        await pool.query('SELECT trida.fn_actualizar_ultimo_acceso($1);', [user.id_usuario]);

        // 6. Devolver token + datos del usuario (SIN el hash)
        res.json({
            token,
            user: {
                id:     user.id_usuario,
                nombre: user.nombre_completo,
                email:  user.email,
                rol:    user.rol,
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// ════════════════════════════════════════════════════════════
//  AUTH - REGISTER (solo admin)
// ════════════════════════════════════════════════════════════
app.post('/api/auth/register', verifyToken, requireAdmin, async (req, res) => {
    const { nombre_completo, email, password, rol } = req.body;

    if (!nombre_completo || !email || !password || !rol) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const rolesValidos = ['ADMINISTRADOR', 'ANALISTA', 'OPERADOR', 'AUDITOR'];
    if (!rolesValidos.includes(rol.toUpperCase())) {
        return res.status(400).json({ error: 'Rol inválido. Use: ADMINISTRADOR, ANALISTA, OPERADOR o AUDITOR' });
    }

    try {
        const hash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            'SELECT * FROM trida.fn_register($1, $2, $3, $4, $5);',
            [nombre_completo, email, hash, rol, req.user.id_usuario]
        );

        const nuevoUsuario = result.rows[0];

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: {
                id:     nuevoUsuario.id_usuario,
                nombre: nuevoUsuario.nombre_completo,
                email:  nuevoUsuario.email,
                rol:    nuevoUsuario.rol,
                estado: nuevoUsuario.estado,
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);

        if (error.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
        }

        if (error.code === '23514') {
            return res.status(400).json({ error: 'El formato del email no es válido' });
        }

        res.status(500).json({ error: 'Error interno al crear el usuario' });
    }
});


// ════════════════════════════════════════════════════════════
//  AUTH - ME (datos del usuario logueado)
// ════════════════════════════════════════════════════════════
app.get('/api/auth/me', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM trida.fn_usuario_actual($1);',
            [req.user.id_usuario]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = result.rows[0];

        if (!user.estado) {
            return res.status(403).json({ error: 'Cuenta desactivada' });
        }

        res.json({
            id:             user.id_usuario,
            nombre:         user.nombre_completo,
            email:          user.email,
            rol:            user.rol,
            estado:         user.estado,
            fecha_creacion: user.fecha_creacion,
            ultimo_acceso:  user.ultimo_acceso,
        });

    } catch (error) {
        console.error('Error en /me:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});


// ════════════════════════════════════════════════════════════
//  AUTH - LISTAR USUARIOS DEL SISTEMA (solo admin)
// ════════════════════════════════════════════════════════════
app.get('/api/auth/usuarios-sistema', verifyToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM trida.fn_listar_usuarios_sistema();');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar usuarios del sistema:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});


// ════════════════════════════════════════════════════════════
//  AUTH - RECUPERACIÓN DE CONTRASEÑA
// ════════════════════════════════════════════════════════════
app.post('/api/auth/forgot-password', async (req, res) => {
    const { correo } = req.body;
    try {
        const opcionesEmail = {
            from: `"Proyecto Trida" <${CONFIG.EMAIL.user}>`,
            to: correo,
            subject: 'Recuperación de Contraseña - Proyecto Trida',
            html: `
                <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee;">
                    <h2>¿Olvidaste tu contraseña?</h2>
                    <p>Hola, recibimos una solicitud para restablecer la clave de tu cuenta en Proyecto Trida.</p>
                    <p>Haz clic en el siguiente enlace para crear una nueva contraseña. Este enlace expira en 15 minutos:</p>
                    <a href="${CONFIG.FRONTEND_URL}/reset-password?token=TOKEN_SECRETO_TEMPORAL" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer Contraseña</a>
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


// ════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════
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


// ════════════════════════════════════════════════════════════
//  ANALYTICS
// ════════════════════════════════════════════════════════════
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
            porTipo:   porTipo.rows,
            porCiudad: porCiudad.rows,
            porCanal:  porCanal.rows,
            porBanco:  porBanco.rows,
        });
    } catch (error) {
        console.error('Error al consultar agregaciones:', error);
        res.status(500).json({ error: 'No se pudieron obtener las agregaciones' });
    }
});


// ════════════════════════════════════════════════════════════
//  MAPA
// ════════════════════════════════════════════════════════════
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


// ════════════════════════════════════════════════════════════
//  CATÁLOGO DE BANCOS
// ════════════════════════════════════════════════════════════
app.get('/api/bancos', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM trida.fn_bancos();');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar bancos:', error);
        res.status(500).json({ error: 'No se pudieron obtener los bancos' });
    }
});


// ════════════════════════════════════════════════════════════
//  ARRANQUE DEL SERVIDOR
// ════════════════════════════════════════════════════════════
app.listen(CONFIG.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${CONFIG.PORT}`);
});