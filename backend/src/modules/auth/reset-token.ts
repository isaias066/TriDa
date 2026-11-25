import { createHmac } from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const PASSWORD_RESET_PURPOSE = "password_reset";
export const PASSWORD_RESET_TOKEN_TTL_SECONDS = 20 * 60;

const passwordResetSecret = (passwordHash: string, serverSecret: string): Buffer =>
  createHmac("sha256", serverSecret).update(`password-reset:${passwordHash}`).digest();

export const createPasswordResetToken = (
  userId: number,
  passwordHash: string,
  serverSecret: string,
): string =>
  jwt.sign(
    { id_usuario: userId, purpose: PASSWORD_RESET_PURPOSE },
    passwordResetSecret(passwordHash, serverSecret),
    { expiresIn: PASSWORD_RESET_TOKEN_TTL_SECONDS, algorithm: "HS256" },
  );

export const getUnverifiedPasswordResetUserId = (token: string): number | null => {
  const payload = jwt.decode(token);
  if (
    !payload ||
    typeof payload === "string" ||
    payload.purpose !== PASSWORD_RESET_PURPOSE ||
    typeof payload.id_usuario !== "number" ||
    !Number.isSafeInteger(payload.id_usuario) ||
    payload.id_usuario <= 0
  ) {
    return null;
  }

  return payload.id_usuario;
};

export const verifyPasswordResetToken = (
  token: string,
  userId: number,
  passwordHash: string,
  serverSecret: string,
): boolean => {
  try {
    const payload = jwt.verify(
      token,
      passwordResetSecret(passwordHash, serverSecret),
      { algorithms: ["HS256"] },
    ) as JwtPayload;
    return payload.id_usuario === userId && payload.purpose === PASSWORD_RESET_PURPOSE;
  } catch {
    return false;
  }
};
