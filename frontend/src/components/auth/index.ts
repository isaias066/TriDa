// ¿Qué? Barrel export que centraliza todos los componentes de autenticación.
// ¿Para qué? Permitir importar múltiples componentes desde una sola ruta
//            (@components/auth) en vez de tener que importar de cada archivo.
// ¿Impacto? Simplifica los imports en LoginPage, ForgotPasswordPage,
//           ResetPasswordPage y cualquier página relacionada con auth.

// ==============================================================================
// INPUTS ESPECIALIZADOS
// ==============================================================================

export { PasswordInput } from './PasswordInput';
export type { PasswordInputProps } from './PasswordInput';

export {
  PasswordStrengthMeter,
  analyzePassword,
} from './PasswordStrengthMeter';
export type {
  PasswordStrengthMeterProps,
  PasswordStrength,
  PasswordRequirement,
  PasswordAnalysis,
} from './PasswordStrengthMeter';

// ==============================================================================
// FORMULARIOS DE AUTENTICACIÓN
// ==============================================================================

export { LoginForm } from './LoginForm';
export type { LoginFormProps } from './LoginForm';

export { ForgotPasswordForm } from './ForgotPasswordForm';
export type { ForgotPasswordFormProps } from './ForgotPasswordForm';

export { ResetPasswordForm } from './ResetPasswordForm';
export type { ResetPasswordFormProps } from './ResetPasswordForm';