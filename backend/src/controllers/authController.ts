import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { CONFIG } from '../config/env';
import dispatcher from '../config/mailer';
import { JwtPayloadCustom } from '../types/express';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    try {
        const result = await pool.query('SELECT * FROM trida.fn_login($1);', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        if (!user.estado) {
            return res.status(403).json({ error: 'Tu cuenta está desactivada. Contacta al administrador.' });
        }

        const passwordOK = await bcrypt.compare(password, user.password_hash);

        if (!passwordOK) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            {
                id_usuario: user.id_usuario,
                email: user.email,
                rol: user.rol,
                nombre: user.nombre_completo,
            },
           CONFIG.JWT_SECRET,
  { expiresIn: CONFIG.JWT_EXPIRES_IN as any }

        );

        await pool.query('SELECT trida.fn_actualizar_ultimo_acceso($1);', [user.id_usuario]);

        res.json({
            token,
            user: {
                id: user.id_usuario,
                nombre: user.nombre_completo,
                email: user.email,
                rol: user.rol,
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const register = async (req: Request, res: Response) => {
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
            [nombre_completo, email, hash, rol, req.user?.id_usuario]
        );

        const nuevoUsuario = result.rows[0];

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: {
                id: nuevoUsuario.id_usuario,
                nombre: nuevoUsuario.nombre_completo,
                email: nuevoUsuario.email,
                rol: nuevoUsuario.rol,
                estado: nuevoUsuario.estado,
            }
        });

    } catch (error: any) {
        console.error('Error en registro:', error);

        if (error.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
        }

        if (error.code === '23514') {
            return res.status(400).json({ error: 'El formato del email no es válido' });
        }

        res.status(500).json({ error: 'Error interno al crear el usuario' });
    }
};

export const verifyResetToken = async (req: Request, res: Response) => {
    const token = req.query.token as string;

    if (!token) {
        return res.status(400).json({ valid: false, error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JwtPayloadCustom;
        if (decoded.purpose !== 'reset_password') {
            return res.status(401).json({ valid: false, error: 'Token inválido' });
        }
        res.json({ valid: true, email: decoded.email });
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ valid: false, error: 'El enlace ha expirado' });
        }
        res.status(401).json({ valid: false, error: 'Token inválido' });
    }
};

export const listarUsuariosSistema = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM trida.fn_listar_usuarios_sistema();');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar usuarios del sistema:', error);
        res.status(500).json({ error: 'Error interno' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ error: 'El correo es obligatorio' });
    }

    try {
        const userResult = await pool.query(
            'SELECT id_usuario, nombre_completo, email, estado FROM trida.usuarios_sistemas WHERE LOWER(email) = LOWER($1);',
            [correo.trim()]
        );

        if (userResult.rows.length === 0 || !userResult.rows[0].estado) {
            return res.json({
                message: 'Si el correo existe, recibirás un enlace de recuperación en breve.'
            });
        }

        const user = userResult.rows[0];

        const resetToken = jwt.sign(
            {
                id_usuario: user.id_usuario,
                email: user.email,
                purpose: 'reset_password',
            },
            CONFIG.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const resetLink = `${CONFIG.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const opcionesEmail = {
            from: `"TriDa - Sistema Antifraude" <angiecatalinabueno.v.066@gmail.com>`,
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
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetLink}" 
                               style="background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 700;">
                                🔐 Restablecer Contraseña
                            </a>
                        </div>
                    </div>
                </div>
            `
        };

        await dispatcher.sendMail(opcionesEmail);

        res.json({
            message: 'Si el correo existe, recibirás un enlace de recuperación en breve.'
        });

    } catch (error) {
        console.error("❌ Error enviando el correo:", error);
        res.status(500).json({ error: 'No se pudo procesar la solicitud' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token, nuevaContrasena } = req.body;

    if (!token || !nuevaContrasena) {
        return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
    }

    if (nuevaContrasena.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    try {
        let decoded: JwtPayloadCustom;
        try {
            decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JwtPayloadCustom;
        } catch (err: any) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'El enlace ha expirado. Solicita uno nuevo.' });
            }
            return res.status(401).json({ error: 'Enlace inválido o manipulado' });
        }

        if (decoded.purpose !== 'reset_password') {
            return res.status(401).json({ error: 'Token inválido' });
        }

        const hash = await bcrypt.hash(nuevaContrasena, 12);

        const resultado = await pool.query(
            'SELECT * FROM trida.fn_cambiar_contrasena($1, $2);',
            [decoded.email, hash]
        );

        if (resultado.rows.length === 0 || resultado.rows[0].actualizado === false) {
            return res.status(404).json({ error: 'No se pudo actualizar la contraseña' });
        }

        res.json({
            message: '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.',
            email: decoded.email,
        });

    } catch (error) {
        console.error("❌ Error al cambiar contraseña:", error);
        res.status(500).json({ error: 'Error interno al actualizar la contraseña' });
    }
};

