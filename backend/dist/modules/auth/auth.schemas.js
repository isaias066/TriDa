// ¿Qué? Esquemas de validación Zod para el módulo de autenticación.
// ¿Para qué? Validar email, contraseña, roles, perfil y cambio de contraseña.
// ¿Impacto? Cumple RS-006 y exige contraseña mínima de 10 caracteres con complejidad.
import { z } from 'zod';
const passwordSchema = z
    .string()
    .min(10, 'La contraseña debe tener al menos 10 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe incluir al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe incluir al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe incluir al menos un número');
export const loginSchema = z.object({
    email: z.string().email('El correo electrónico no es válido'),
    password: z.string().min(1, 'La contraseña es obligatoria'),
});
export const registerSchema = z.object({
    nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: z.string().email('El correo electrónico no es válido'),
    password: passwordSchema,
    rol: z.enum(['ADMINISTRADOR', 'ANALISTA', 'OPERADOR', 'AUDITOR'], {
        errorMap: () => ({
            message: 'Rol inválido. Use: ADMINISTRADOR, ANALISTA, OPERADOR o AUDITOR',
        }),
    }),
});
export const forgotPasswordSchema = z.object({
    correo: z.string().email('El correo electrónico no es válido'),
});
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'El token es obligatorio'),
    nuevaContrasena: passwordSchema,
});
/** PATCH perfil — usuarios_sistemas no tiene teléfono en BD. */
export const updateProfileSchema = z
    .object({
    nombre_completo: z
        .string()
        .trim()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(150)
        .optional(),
    email: z.string().trim().email('El correo electrónico no es válido').max(254).optional(),
})
    .refine((data) => data.nombre_completo !== undefined || data.email !== undefined, {
    message: 'Debes enviar al menos un campo para actualizar',
});
/** POST cambio de contraseña autenticado. */
export const changePasswordSchema = z.object({
    contrasenaActual: z.string().min(1, 'La contraseña actual es obligatoria'),
    nuevaContrasena: passwordSchema,
});
//# sourceMappingURL=auth.schemas.js.map