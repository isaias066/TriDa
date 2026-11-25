/**
 * ¿Qué? Formulario de registro público de nuevos usuarios.
 * ¿Para qué? Capturar los datos requeridos por registerSchema (email, password, nombre_completo, telefono).
 */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User as UserIcon, Phone, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { getPasswordValidationMessage } from "@/utils/Password";

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Validación rápida en frontend antes de enviar al backend
  const validateForm = (): boolean => {
    if (!nombreCompleto.trim()) {
      setFormError("El nombre completo es requerido.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Ingresa un correo electrónico válido.");
      return false;
    }
    const passwordError = getPasswordValidationMessage(password);
    if (passwordError) {
      setFormError(passwordError);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await register({
        nombre_completo: nombreCompleto.trim(),
        email: email.trim().toLowerCase(),
        password,
        telefono: telefono.trim() || undefined,
      });

      showToast({
        type: result.emailVerificationRequired ? "info" : "success",
        title: result.emailVerificationRequired
          ? "Revisa tu correo"
          : "Registro recibido",
        message: result.message,
      });
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al registrar el usuario.";
      setFormError(message);
      showToast({
        type: "error",
        title: "Error de registro",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {formError && (
        <div className="rounded-lg bg-expense/10 border border-expense/20 p-3 text-xs text-expense font-medium">
          {formError}
        </div>
      )}

      <Input
        label="Nombre completo"
        type="text"
        placeholder="Juan Pérez"
        value={nombreCompleto}
        onChange={(e) => setNombreCompleto(e.target.value)}
        leftIcon={<UserIcon className="w-4 h-4 text-text-muted" />}
        required
      />

      <Input
        label="Correo electrónico"
        type="email"
        placeholder="juan@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail className="w-4 h-4 text-text-muted" />}
        required
        autoComplete="email"
      />

      <Input
        label="Teléfono (Opcional)"
        type="tel"
        placeholder="300 123 4567"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        leftIcon={<Phone className="w-4 h-4 text-text-muted" />}
      />

      <div>
        <Input
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4 text-text-muted" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-text-muted hover:text-text-primary focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          required
          autoComplete="new-password"
        />

        <PasswordStrengthMeter password={password} />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-3"
        isLoading={isSubmitting}
      >
        Crear cuenta gratis
      </Button>

      <div className="pt-4 text-center border-t border-border">
        <p className="text-xs text-text-secondary">
          ¿Ya tienes una cuenta registrado?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </form>
  );
};
