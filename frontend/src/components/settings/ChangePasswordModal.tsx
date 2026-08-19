// ¿Qué? Modal para cambiar la contraseña del usuario actual.
// ¿Para qué? Reemplazar el modal inline de settings.jsx con un componente
//            tipado que usa PasswordInput y PasswordStrengthMeter.
// ¿Impacto? Se usa en ProfileTab de Settings. Valida contraseña actual,
//           nueva contraseña y confirmación.

import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { PasswordInput } from '@components/auth/PasswordInput';
import {
  PasswordStrengthMeter,
  analyzePassword,
} from '@components/auth/PasswordStrengthMeter';

// ==============================================================================
// TYPES
// ==============================================================================

export interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ChangePasswordModal({
  open,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [currentError, setCurrentError] = useState('');
  const [newError, setNewError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [globalError, setGlobalError] = useState('');

  // ==============================================================================
  // VALIDACIÓN
  // ==============================================================================

  const validate = (): boolean => {
    let isValid = true;
    setCurrentError('');
    setNewError('');
    setConfirmError('');
    setGlobalError('');

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

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setGlobalError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSuccess?.();
      handleClose();
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : 'Error al cambiar la contraseña'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = (): void => {
    if (saving) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentError('');
    setNewError('');
    setConfirmError('');
    setGlobalError('');
    onClose();
  };

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const formStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '16px',
  };

  const errorStyle: React.CSSProperties = {
    padding:      '10px 14px',
    background:   'rgba(239, 68, 68, 0.1)',
    border:       '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color:        '#EF4444',
    fontSize:     '12px',
    fontWeight:   600,
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

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
            onClick={handleSubmit}
            loading={saving}
            leftIcon={!saving ? <KeyRound size={14} /> : undefined}
          >
            Cambiar contraseña
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={formStyle} noValidate>
        {globalError && (
          <div style={errorStyle} role="alert">⚠️ {globalError}</div>
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