import { createBrandedEmailTemplate } from "./branded-email-template.js";

export function createTransactionConfirmationEmailTemplate(
  amount: string,
  merchant: string,
  confirmationUrl: string,
) {
  return createBrandedEmailTemplate({
    preheader: "Revisa un gasto automático registrado en tu cuenta de TriDa.",
    badge: "CONFIRMACIÓN DE MOVIMIENTO",
    title: "¿Reconoces este gasto?",
    description: `Se registró un gasto automático de ${amount} en ${merchant}.`,
    actionLabel: "Revisar el movimiento",
    actionUrl: confirmationUrl,
    expiration:
      "Tienes 15 minutos para responder. Abrir el enlace no consume la confirmación ni aprueba el gasto.",
    securityNote:
      "Si no reconoces este movimiento, indícalo en la página de confirmación para proteger tu cuenta.",
  });
}

export function createCriticalAlertEmailTemplate(alertsUrl: string) {
  return createBrandedEmailTemplate({
    preheader: "Se generó una alerta crítica de seguridad en tu cuenta de TriDa.",
    badge: "ALERTA DE SEGURIDAD",
    title: "Alerta crítica de seguridad",
    description:
      "Se rechazó un gasto automático no reconocido y se generó una alerta crítica en tu cuenta de TriDa. Revisa la alerta y protege tus cuentas vinculadas.",
    actionLabel: "Revisar mis alertas",
    actionUrl: alertsUrl,
    expiration: "La alerta queda disponible en el Centro de Alertas de TriDa.",
    securityNote:
      "Si no reconoces este movimiento, revisa la alerta desde la aplicación y contacta a tu entidad financiera.",
  });
}
