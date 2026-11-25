export interface PasswordChecks {
  minLength: boolean;
  maxLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasSpecial: boolean;
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 12,
    maxLength: password.length <= 72,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasSpecial: /[^\p{L}\p{N}\s]/u.test(password),
  };
}

export function isStrongPassword(password: string): boolean {
  return Object.values(getPasswordChecks(password)).every(Boolean);
}

export function getPasswordValidationMessage(password: string): string {
  const checks = getPasswordChecks(password);
  if (!checks.minLength) {
    return "La contraseña debe tener al menos 12 caracteres.";
  }
  if (!checks.maxLength) {
    return "La contraseña no puede superar los 72 caracteres.";
  }
  if (!checks.hasUpper || !checks.hasLower || !checks.hasSpecial) {
    return "La contraseña debe contener al menos una mayúscula, una minúscula y un carácter especial distinto de letras, números o espacios.";
  }
  return "";
}
