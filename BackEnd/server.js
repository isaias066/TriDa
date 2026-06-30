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
        user: 'angiecatalinabueno.v.066@gmail.com',
        pass: 'dywe zbzo mrqh ajal',
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
//  AUTH - VERIFICAR SI UN TOKEN DE RESET ES VÁLIDO (sin cambiar nada)
// ════════════════════════════════════════════════════════════
app.get('/api/auth/verify-reset-token', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ valid: false, error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
        if (decoded.purpose !== 'reset_password') {
            return res.status(401).json({ valid: false, error: 'Token inválido' });
        }
        res.json({ valid: true, email: decoded.email });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ valid: false, error: 'El enlace ha expirado' });
        }
        res.status(401).json({ valid: false, error: 'Token inválido' });
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
//  AUTH - SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ════════════════════════════════════════════════════════════
app.post('/api/auth/forgot-password', async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ error: 'El correo es obligatorio' });
    }

    try {
        // 1. Verificar que el email existe en la BD
        const userResult = await pool.query(
            'SELECT id_usuario, nombre_completo, email, estado FROM trida.usuarios_sistemas WHERE LOWER(email) = LOWER($1);',
            [correo.trim()]
        );

        // ⚠️ Por seguridad, NO revelamos si el email existe o no
        // Siempre devolvemos "éxito" pero solo enviamos email si es válido
        if (userResult.rows.length === 0) {
            console.log(`⚠️ Intento de recuperación para email no registrado: ${correo}`);
            return res.json({
                message: 'Si el correo existe, recibirás un enlace de recuperación en breve.'
            });
        }

        const user = userResult.rows[0];

        if (!user.estado) {
            console.log(`⚠️ Intento de recuperación para cuenta desactivada: ${correo}`);
            return res.json({
                message: 'Si el correo existe, recibirás un enlace de recuperación en breve.'
            });
        }

        // 2. Generar token JWT temporal (15 minutos)
        const resetToken = jwt.sign(
            {
                id_usuario: user.id_usuario,
                email:      user.email,
                purpose:    'reset_password',
            },
            CONFIG.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // 3. Construir el link
        const resetLink = `${CONFIG.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // 4. Enviar email
        const opcionesEmail = {
            from: `"TriDa - Sistema Antifraude" <${CONFIG.EMAIL.user}>`,
            to: user.email,
            subject: '🔐 Recuperación de contraseña - TriDa',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f7; padding: 40px 20px;">
                    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                        
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #6366F1; margin: 0; font-size: 28px; font-weight: 800;">TriDa</h1>
                            <p style="color: #6B7280; margin: 4px 0 0; font-size: 13px;">Monitor de Transacciones con IA</p>
                        </div>

                        <h2 style="color: #1c1c1e; font-size: 20px; margin: 0 0 12px;">Hola, ${user.nombre_completo} 👋</h2>
                        <p style="color: #4B5563; line-height: 1.6; margin: 0 0 24px;">
                            Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>TriDa</strong>.
                        </p>
                        <p style="color: #4B5563; line-height: 1.6; margin: 0 0 24px;">
                            Haz clic en el botón de abajo para crear una nueva contraseña. <strong>Este enlace expirará en 15 minutos.</strong>
                        </p>

                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetLink}" 
                               style="background: linear-gradient(135deg, #6366F1, #8B5CF6); 
                                      color: white; 
                                      padding: 14px 32px; 
                                      text-decoration: none; 
                                      border-radius: 12px; 
                                      display: inline-block;
                                      font-weight: 700;
                                      font-size: 14px;
                                      box-shadow: 0 4px 14px rgba(99,102,241,0.4);">
                                🔐 Restablecer Contraseña
                            </a>
                        </div>

                        <p style="color: #6B7280; font-size: 12px; line-height: 1.5; margin: 24px 0 0;">
                            Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
                            <a href="${resetLink}" style="color: #6366F1; word-break: break-all;">${resetLink}</a>
                        </p>

                        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0 20px;"/>

                        <p style="color: #9CA3AF; font-size: 11px; line-height: 1.5; margin: 0;">
                            ⚠️ Si tú NO solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá segura.
                        </p>
                        <p style="color: #9CA3AF; font-size: 11px; margin: 8px 0 0;">
                            Por seguridad, este enlace solo es válido por 15 minutos.
                        </p>
                    </div>

                    <p style="text-align: center; color: #9CA3AF; font-size: 11px; margin: 16px 0 0;">
                        © ${new Date().getFullYear()} TriDa - Sistema Antifraude Bancario
                    </p>
                </div>
            `
        };

        await dispatcher.sendMail(opcionesEmail);

        console.log(`✅ Correo de recuperación enviado a: ${user.email}`);

        res.json({
            message: 'Si el correo existe, recibirás un enlace de recuperación en breve.'
        });

    } catch (error) {
        console.error("❌ Error enviando el correo:", error);
        res.status(500).json({ error: 'No se pudo procesar la solicitud' });
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
//  AUTH - RESETEAR CONTRASEÑA (con token del email)
// ════════════════════════════════════════════════════════════
app.post('/api/auth/reset-password', async (req, res) => {
    const { token, nuevaContrasena } = req.body;

    if (!token || !nuevaContrasena) {
        return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
    }

    if (nuevaContrasena.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    try {
        // 1. Verificar y decodificar el token
        let decoded;
        try {
            decoded = jwt.verify(token, CONFIG.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'El enlace ha expirado. Solicita uno nuevo.' });
            }
            return res.status(401).json({ error: 'Enlace inválido o manipulado' });
        }

        // 2. Verificar que el token sea para reset
        if (decoded.purpose !== 'reset_password') {
            return res.status(401).json({ error: 'Token inválido' });
        }

        // 3. Hashear nueva contraseña
        const hash = await bcrypt.hash(nuevaContrasena, 12);

        // 4. Actualizar en BD usando la función
        const resultado = await pool.query(
            'SELECT * FROM trida.fn_cambiar_contrasena($1, $2);',
            [decoded.email, hash]
        );

        console.log('🔍 Resultado de fn_cambiar_contrasena:', resultado.rows);

        if (resultado.rows.length === 0 || resultado.rows[0].actualizado === false) {
            return res.status(404).json({ error: 'No se pudo actualizar la contraseña' });
        }

        console.log(`✅ Contraseña actualizada para: ${decoded.email}`);

        res.json({
            message: '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.',
            email: decoded.email,
        });

    } catch (error) {
        console.error("❌ Error al cambiar contraseña:");
        console.error("   Código:  ", error.code || 'N/A');
        console.error("   Mensaje: ", error.message);
        console.error("   Stack:   ", error.stack);
        res.status(500).json({ error: 'Error interno al actualizar la contraseña' });
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