import jwt, { type JwtPayload } from "jsonwebtoken";

export const EMAIL_VERIFICATION_PURPOSE = "email_verification";
export const EMAIL_VERIFICATION_TOKEN_TTL_SECONDS = 15 * 60;

export const createEmailVerificationToken = (
  userId: number,
  email: string,
  serverSecret: string,
): string =>
  jwt.sign({ id_usuario: userId, email, purpose: EMAIL_VERIFICATION_PURPOSE }, serverSecret, {
    expiresIn: EMAIL_VERIFICATION_TOKEN_TTL_SECONDS,
    algorithm: "HS256",
  });

export const getUnverifiedEmailVerificationUserId = (token: string): number | null => {
  const payload = jwt.decode(token);
  if (
    !payload ||
    typeof payload === "string" ||
    payload.purpose !== EMAIL_VERIFICATION_PURPOSE ||
    typeof payload.id_usuario !== "number" ||
    !Number.isSafeInteger(payload.id_usuario) ||
    payload.id_usuario <= 0
  ) {
    return null;
  }

  return payload.id_usuario;
};

export const verifyEmailVerificationToken = (
  token: string,
  userId: number,
  email: string,
  serverSecret: string,
): boolean => {
  try {
    const payload = jwt.verify(token, serverSecret, {
      algorithms: ["HS256"],
    }) as JwtPayload;
    return (
      payload.id_usuario === userId &&
      payload.email === email &&
      payload.purpose === EMAIL_VERIFICATION_PURPOSE
    );
  } catch {
    return false;
  }
};
