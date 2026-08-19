// ¿Qué? Modal para crear un nuevo usuario del sistema TriDa.
// ¿Para qué? Reemplazar el modal inline de settings.jsx con un componente
//            tipado que usa los roles correctos y valida el formulario.
// ¿Impacto? Solo accesible por ADMINISTRADOR. Crea usuarios con roles
//           ADMINISTRADOR, ANALISTA, OPERADOR o AUDITOR.

import { useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';import { useAuth } from '@context/AuthContext';
import { useBank } from '@context/BankContext';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { PasswordInput } from '@components/auth/PasswordInput';
import {
  PasswordStrengthMeter,
  analyzePassword,
} from '@components/auth/PasswordStrengthMeter';
import { ROLES_LIST } from '@constants/Roles';
import { isValidEmail, isValidName } from '@utils/User';
import type { RegisterPayload } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

export interface NewUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ==============================================================================
// ESTADO INICIAL DEL FORMULARIO
// ==============================================================================

const INITIAL_FORM = {
  name:            '',
  email:           '',
  password:        '',
  confirmPassword: '',
  role:            'OPERADOR' as RegisterPayload['rol'],
  bank:            '',
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function NewUserModal({
  open,
  onClose,
  onSuccess,
}: NewUserModalProps) {
  const { register } = useAuth();
  const { banks } = useBank();

  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  // Errores
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [globalError, setGlobalError] = useState('');

  // ==============================================================================
  // HELPERS
  // ==============================================================================

  const updateField = <K extends keyof typeof INITIAL_FORM>(
    field: K,
    value: typeof INITIAL_FORM[K]
  ): void => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // ==============================================================================
  // VALIDACIÓN
  // ==============================================================================

  const validate = (): boolean => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setGlobalError('');

    if (!isValidName(form.name)) {
      setNameError('El nombre debe tener entre 2 y 150 caracteres');
      isValid = false;
    }

    if (!isValidEmail(form.email)) {
      setEmailError('Ingresa un email válido');
      isValid = false;
    }

    const analysis = analyzePassword(form.password);
    if (!form.password) {
      setPasswordError('La contraseña es obligatoria');
      isValid = false;
    } else if (!analysis.isValid) {
      setPasswordError('La contraseña no cumple los requisitos de seguridad');
      isValid = false;
    }

    if (form.password !== form.confirmPassword) {
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
      await register({
        nombre_completo: form.name.trim(),
        email:           form.email.trim(),
        password:        form.password,
        rol:             form.role,
      });

      onSuccess?.();
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear el usuario';
      setGlobalError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = (): void => {
    if (saving) return;
    setForm(INITIAL_FORM);
    setNameError('');
    setEmailError('');
    setPasswordError('');
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

  const rowStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 '12px',
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
  // OPCIONES DE SELECT
  // ==============================================================================

  const roleOptions = ROLES_LIST.map(role => ({
    value: role.id,
    label: role.label,
  }));

  const bankOptions = [
    { value: '', label: 'Sin banco asignado' },
    ...banks.map(bank => ({
      value: bank.id,
      label: bank.name,
    })),
  ];

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nuevo usuario del sistema"
      size="lg"
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
            leftIcon={!saving ? <Save size={14} /> : undefined}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={formStyle} noValidate>
        {globalError && (
          <div style={errorStyle} role="alert">⚠️ {globalError}</div>
        )}

        <Input
          label="Nombre completo"
          value={form.name}
          onChange={(e) => {
            updateField('name', e.target.value);
            if (nameError) setNameError('');
          }}
          error={nameError}
          placeholder="Juan Pérez"
          disabled={saving}
          required
        />

        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => {
            updateField('email', e.target.value);
            if (emailError) setEmailError('');
          }}
          error={emailError}
          placeholder="usuario@trida.co"
          disabled={saving}
          required
        />

        <div style={rowStyle}>
          <div>
            <PasswordInput
              label="Contraseña"
              value={form.password}
              onChange={(e) => {
                updateField('password', e.target.value);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
              autoComplete="new-password"
              disabled={saving}
              required
            />
            <PasswordStrengthMeter password={form.password} />
          </div>

          <PasswordInput
            label="Confirmar contraseña"
            value={form.confirmPassword}
            onChange={(e) => {
              updateField('confirmPassword', e.target.value);
              if (confirmError) setConfirmError('');
            }}
            error={confirmError}
            autoComplete="new-password"
            disabled={saving}
            required
          />
        </div>

        <div style={rowStyle}>
          <Select
            label="Rol"
            value={form.role}
            onChange={(val) => updateField('role', val as RegisterPayload['rol'])}
            options={roleOptions}
            disabled={saving}
            required
          />

          <Select
            label="Banco asignado (opcional)"
            value={form.bank}
            onChange={(val) => updateField('bank', val)}
            options={bankOptions}
            disabled={saving}
          />
        </div>
      </form>
    </Modal>
  );
}