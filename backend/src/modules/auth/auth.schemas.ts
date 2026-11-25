import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^\p{L}\p{N}\s])/u;

const strongPassword = z
  .string()
  .min(12, "La contraseña debe tener al menos 12 caracteres")
  .max(72, "La contraseña no puede superar los 72 caracteres")
  .regex(
    passwordRegex,
    "La contraseña debe contener al menos una mayúscula, una minúscula y un carácter especial distinto de letras, números o espacios",
  );

export const registerSchema = z
  .object({
    email: z.string().trim().email("Correo electrónico inválido").toLowerCase(),
    password: strongPassword,
    nombre_completo: z.string().trim().min(1, "El nombre completo es requerido").max(150),
    telefono: z.string().max(20).optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email("Correo electrónico inválido").toLowerCase(),
    password: z.string().min(1, "La contraseña es requerida"),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: z.string().trim().email("Correo electrónico inválido").toLowerCase(),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "El token es requerido"),
    password_nueva: strongPassword,
  })
  .strict();

export const verifyResetTokenSchema = z
  .object({
    token: z.string().min(1, "El token es requerido"),
  })
  .strict();

export const verifyEmailSchema = z
  .object({
    token: z.string().min(1, "El token es requerido"),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    nombre_completo: z.string().trim().min(1).max(150).optional(),
    telefono: z.string().max(20).nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar",
  });

export const changePasswordSchema = z
  .object({
    password_actual: z.string().min(1, "La contraseña actual es requerida"),
    password_nueva: strongPassword,
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
