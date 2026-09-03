// ¿Qué? Servicio para envío de correos transaccionales a prueba de fallos.
// ¿Para qué? Enviar correos de recuperación sin tumbar el servidor si falla la conexión SMTP.
// ¿Impacto? Permite probar el flujo de olvido de contraseña en entorno local sin credenciales reales.
import nodemailer from 'nodemailer';
import { config } from '../config.js';
export const mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
    },
});
export const sendEmail = async (to, subject, html) => {
    // Si no hay correo o son los valores de ejemplo, omitir el envío real
    if (!config.EMAIL_USER || config.EMAIL_USER.includes('tu_correo')) {
        console.warn(`⚠️ [DEV] Correo omitido a <${to}> (EMAIL_USER no configurado). Asunto: ${subject}`);
        return;
    }
    try {
        await mailer.sendMail({
            from: config.EMAIL_FROM,
            to,
            subject,
            html,
        });
        console.log(`✅ Correo enviado con éxito a <${to}>`);
    }
    catch (error) {
        console.error(`❌ Error de conexión al enviar correo a <${to}>:`, error);
        // No lanzamos la excepción para evitar que el servidor devuelva un error 500 al cliente
    }
};
//# sourceMappingURL=mailer.util.js.map