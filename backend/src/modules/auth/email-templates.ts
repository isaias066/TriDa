import { createBrandedEmailTemplate } from "../../utils/branded-email-template.js";

export function createEmailVerificationTemplate(verificationUrl: string) {
  return createBrandedEmailTemplate({
    preheader: "Confirma tu correo para activar tu cuenta de TriDa.",
    badge: "VERIFICACIÓN DE CUENTA",
    title: "Confirma tu correo",
    description:
      "Gracias por registrarte en TriDa. Confirma tu dirección de correo para activar tu cuenta y comenzar.",
    actionLabel: "Verificar mi correo",
    actionUrl: verificationUrl,
    expiration:
      "Este enlace vence en 15 minutos y solo puede utilizarse para verificar esta cuenta.",
    securityNote:
      "Si no creaste una cuenta en TriDa, puedes ignorar este mensaje. No compartas este enlace con nadie.",
  });
}

export function createPasswordResetEmailTemplate(resetUrl: string) {
  return createBrandedEmailTemplate({
    preheader: "Usa el enlace seguro para restablecer tu contraseña de TriDa.",
    badge: "SEGURIDAD DE CUENTA",
    title: "Restablece tu contraseña",
    description:
      "Recibimos una solicitud para cambiar la contraseña de tu cuenta de TriDa. Usa el botón para elegir una nueva.",
    actionLabel: "Crear nueva contraseña",
    actionUrl: resetUrl,
    expiration: "Este enlace vence en 20 minutos y solo puede utilizarse una vez.",
    securityNote:
      "Si no solicitaste este cambio, ignora el mensaje; tu contraseña no cambiará. Nunca compartas este enlace ni tu contraseña.",
  });
}
