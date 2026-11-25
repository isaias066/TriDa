// ¿Qué? Servicio para enviar correos transaccionales mediante SMTP configurado.
// ¿Para qué? Centralizar el envío y propagar fallos para que el flujo que lo usa los registre.

import nodemailer from "nodemailer";
import { config } from "../config.js";

let transport: ReturnType<typeof nodemailer.createTransport> | undefined;
let activeSends = 0;
let closing = false;
const closeWaiters: Array<() => void> = [];

export const isEmailConfigured = (): boolean =>
  config.SMTP_ENABLED && Boolean(config.SMTP_HOST && config.EMAIL_USER && config.EMAIL_PASS);

const getTransport = (): ReturnType<typeof nodemailer.createTransport> => {
  if (closing) {
    throw new Error("El transporte SMTP se está cerrando");
  }
  if (!isEmailConfigured()) {
    throw new Error("La configuración SMTP está incompleta");
  }

  if (!transport) {
    transport = nodemailer.createTransport({
      pool: true,
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    });
  }

  return transport;
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string,
): Promise<void> => {
  const activeTransport = getTransport();
  activeSends += 1;
  try {
    await activeTransport.sendMail({
      from: config.EMAIL_FROM,
      to,
      subject,
      html,
      ...(text ? { text } : {}),
    });
  } finally {
    activeSends -= 1;
    if (activeSends === 0) {
      closeWaiters.splice(0).forEach((resolve) => resolve());
    }
  }
};

export const closeMailer = async (): Promise<void> => {
  closing = true;
  if (activeSends > 0) {
    await new Promise<void>((resolve) => {
      closeWaiters.push(resolve);
    });
  }
  transport?.close();
  transport = undefined;
};
