// ¿Qué? Modal para cambiar la contraseña del usuario actual.
// ¿Para qué? Validar contraseñas y llamar al backend real con feedback por Toasts de error.
// ¿Impacto? Se integra con ProfileTab y responde a eventos de forma limpia.

import { useState, type FormEvent } from 'react';
import { KeyRound, AlertCircle, X } from 'lucide-react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { PasswordInput } from '@components/auth/PasswordInput';
import { PasswordStrengthMeter, analyzePassword } from '@components/auth/PasswordStrengthMeter';
import { changePassword } from '@api/Auth';

export interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangePasswordModal({ open, onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [currentError, setCurrentError] = useState('');
  const [newError, setNewError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Toast interno para errores globales del modal
  const [toastError, setToastError] = useState<string | null>(null);

  const validate = (): boolean => {
    let isValid = true;
    setCurrentError('');
    setNewError('');
    setConfirmError('');
    setToastError(null);

    if (!currentPassword) {
      setCurrentError('La contraseña actual es obligatoria');
      isValid = false;
    }

    const analysis = analyzePassword(newPassword);
    if (!newPassword) {
      setNewError('La nueva contraseña es obligatoria');
      isValid = false;
    } else if (!analysis.isValid) {
      setNewError('La contraseña no cumple los requisitos de seguridad');
      isValid = false;
    } else if (newPassword === currentPassword) {
      setNewError('La nueva contraseña debe ser diferente a la actual');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Debes confirmar la nueva contraseña');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden');
      isValid = false;
    }

    return isValid;
  };

  const handleClose = (): void => {
    if (saving) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentError('');
    setNewError('');
    setConfirmError('');
    setToastError(null);
    onClose();
  };

  const handleSubmit = async (e?: FormEvent): Promise<void> => {
    e?.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setToastError(null);

    try {
      await changePassword({
        contrasenaActual: currentPassword,
        nuevaContrasena: newPassword,
      });

      onSuccess?.();
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar la contraseña';
      setToastError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Cambiar contraseña"
      size="sm"
      disableClose={saving}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleSubmit()}
            loading={saving}
            leftIcon={!saving ? <KeyRound size={14} /> : undefined}
          >
            Cambiar contraseña
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-col gap-4 font-sans relative"
        noValidate
      >
        {/* Toast interno de error del modal */}
        {toastError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-950/80 p-3.5 text-xs font-semibold text-rose-200 animate-slide-in"
          >
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-400" />
            <div className="flex-1 leading-normal">{toastError}</div>
            <button
              type="button"
              onClick={() => setToastError(null)}
              className="rounded-lg p-0.5 text-rose-400 hover:bg-rose-900/30 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <PasswordInput
          label="Contraseña actual"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (currentError) setCurrentError('');
          }}
          error={currentError}
          autoComplete="current-password"
          disabled={saving}
          required
        />

        <div>
          <PasswordInput
            label="Nueva contraseña"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (newError) setNewError('');
            }}
            error={newError}
            autoComplete="new-password"
            disabled={saving}
            required
          />
          <PasswordStrengthMeter password={newPassword} />
        </div>

        <PasswordInput
          label="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (confirmError) setConfirmError('');
          }}
          error={confirmError}
          autoComplete="new-password"
          disabled={saving}
          required
        />
      </form>
    </Modal>
  );
}
