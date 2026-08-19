// ¿Qué? Indicador visual de la fuerza de una contraseña con feedback en tiempo real.
// ¿Para qué? Ayudar al usuario a crear contraseñas seguras cumpliendo con
//            los requisitos de RS-003 (mínimo 8 caracteres, mayúsculas, números).
// ¿Impacto? Se usa en formularios de creación/cambio de contraseña (Register,
//           ResetPassword, ChangePassword) para dar feedback inmediato.

import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

// ==============================================================================
// TYPES
// ==============================================================================

export type PasswordStrength =
  | 'empty'      
  | 'weak'       
  | 'fair'       
  | 'good'       
  | 'strong';    

export interface PasswordRequirement {
  /** Identificador único del requisito. */
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export interface PasswordAnalysis {
  score: number;
  strength: PasswordStrength;
  passedRequirements: PasswordRequirement[];
  failedRequirements: PasswordRequirement[];
  isValid: boolean;
}

export interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
  showBar?: boolean;
  requirements?: PasswordRequirement[];
  minRequirementsToPass?: number;
  onAnalysisChange?: (analysis: PasswordAnalysis) => void;
  className?: string;
}

// ==============================================================================
// REQUISITOS POR DEFECTO (RS-003)
// ==============================================================================

const DEFAULT_REQUIREMENTS: PasswordRequirement[] = [
  {
    id:    'length',
    label: 'Mínimo 8 caracteres',
    test:  (pwd) => pwd.length >= 8,
  },
  {
    id:    'uppercase',
    label: 'Al menos una mayúscula (A-Z)',
    test:  (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id:    'lowercase',
    label: 'Al menos una minúscula (a-z)',
    test:  (pwd) => /[a-z]/.test(pwd),
  },
  {
    id:    'number',
    label: 'Al menos un número (0-9)',
    test:  (pwd) => /[0-9]/.test(pwd),
  },
  {
    id:    'special',
    label: 'Al menos un símbolo (!@#$...)',
    test:  (pwd) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(pwd),
  },
];

// ==============================================================================
// CONFIGURACIÓN VISUAL POR NIVEL
// ==============================================================================

const STRENGTH_CONFIG: Record<PasswordStrength, {
  label:      string;
  color:      string;
  background: string;
}> = {
  empty: {
    label:      'Vacía',
    color:      '#9CA3AF',
    background: 'rgba(156, 163, 175, 0.15)',
  },
  weak: {
    label:      'Muy débil',
    color:      '#EF4444',
    background: 'rgba(239, 68, 68, 0.15)',
  },
  fair: {
    label:      'Débil',
    color:      '#F97316',
    background: 'rgba(249, 115, 22, 0.15)',
  },
  good: {
    label:      'Buena',
    color:      '#FBBF24',
    background: 'rgba(251, 191, 36, 0.15)',
  },
  strong: {
    label:      'Fuerte',
    color:      '#34D399',
    background: 'rgba(52, 211, 153, 0.15)',
  },
};

// ==============================================================================
// FUNCIÓN DE ANÁLISIS
// ==============================================================================

/**
 * Analiza una contraseña y retorna su fuerza y requisitos.
 */
export function analyzePassword(
  password: string,
  requirements: PasswordRequirement[] = DEFAULT_REQUIREMENTS,
  minRequirementsToPass?: number
): PasswordAnalysis {
  const passedRequirements = requirements.filter((req) => req.test(password));
  const failedRequirements = requirements.filter((req) => !req.test(password));

  const score = requirements.length === 0
    ? 0
    : Math.round((passedRequirements.length / requirements.length) * 100);

  let strength: PasswordStrength = 'empty';
  if (password.length === 0) {
    strength = 'empty';
  } else if (score <= 25) {
    strength = 'weak';
  } else if (score <= 50) {
    strength = 'fair';
  } else if (score <= 75) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  const requiredCount = minRequirementsToPass ?? requirements.length;
  const isValid = passedRequirements.length >= requiredCount;

  return {
    score,
    strength,
    passedRequirements,
    failedRequirements,
    isValid,
  };
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function PasswordStrengthMeter({
  password,
  showRequirements = true,
  showBar = true,
  requirements = DEFAULT_REQUIREMENTS,
  minRequirementsToPass,
  onAnalysisChange,
  className = '',
}: PasswordStrengthMeterProps) {

  // ==============================================================================
  // ANÁLISIS DE LA CONTRASEÑA
  // ==============================================================================

  const analysis = useMemo(
    () => analyzePassword(password, requirements, minRequirementsToPass),
    [password, requirements, minRequirementsToPass]
  );

  // Notificar al padre si cambia el análisis
  useMemo(() => {
    onAnalysisChange?.(analysis);
  }, [analysis, onAnalysisChange]);

  const config = STRENGTH_CONFIG[analysis.strength];

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '10px',
    fontFamily:    'Inter, sans-serif',
    marginTop:     '8px',
  };

  const barContainerStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '4px',
  };

  const barTrackStyle: React.CSSProperties = {
    width:        '100%',
    height:       '4px',
    background:   'rgba(255, 255, 255, 0.05)',
    borderRadius: '2px',
    overflow:     'hidden',
  };

  const barFillStyle: React.CSSProperties = {
    height:       '100%',
    width:        `${analysis.score}%`,
    background:   config.color,
    borderRadius: '2px',
    transition:   'width 0.3s ease, background 0.3s ease',
  };

  const barLabelStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    fontSize:       '10px',
    fontWeight:     600,
  };

  const strengthLabelStyle: React.CSSProperties = {
    color:         config.color,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const scoreStyle: React.CSSProperties = {
    color:              'var(--text-tertiary)',
    fontVariantNumeric: 'tabular-nums',
  };

  const requirementsListStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '4px',
    listStyle:     'none',
    margin:        0,
    padding:       0,
  };

  const requirementItemStyle = (passed: boolean): React.CSSProperties => ({
    display:    'flex',
    alignItems: 'center',
    gap:        '6px',
    fontSize:   '11px',
    color:      passed ? '#34D399' : 'var(--text-tertiary)',
    transition: 'color 0.2s ease',
  });

  const requirementIconStyle = (passed: boolean): React.CSSProperties => ({
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '16px',
    height:         '16px',
    borderRadius:   '50%',
    background:     passed ? 'rgba(52, 211, 153, 0.15)' : 'rgba(156, 163, 175, 0.1)',
    color:          passed ? '#34D399' : '#9CA3AF',
    flexShrink:     0,
    transition:     'all 0.2s ease',
  });

  // ==============================================================================
  // RENDER
  // ==============================================================================

  if (password.length === 0 && !showRequirements) return null;

  return (
    <div
      className={`password-strength-meter ${className}`}
      style={wrapperStyle}
      role="region"
      aria-label="Análisis de fuerza de contraseña"
    >
      {/* Barra de progreso */}
      {showBar && password.length > 0 && (
        <div style={barContainerStyle}>
          <div
            style={barTrackStyle}
            role="progressbar"
            aria-valuenow={analysis.score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Fuerza de la contraseña: ${config.label}`}
          >
            <div style={barFillStyle} />
          </div>

          <div style={barLabelStyle}>
            <span style={strengthLabelStyle}>{config.label}</span>
            <span style={scoreStyle}>{analysis.score}%</span>
          </div>
        </div>
      )}

      {/* Lista de requisitos */}
      {showRequirements && (
        <ul style={requirementsListStyle} aria-label="Requisitos de contraseña">
          {requirements.map((req) => {
            const passed = req.test(password);
            return (
              <li
                key={req.id}
                style={requirementItemStyle(passed)}
                aria-live="polite"
              >
                <span style={requirementIconStyle(passed)}>
                  {passed ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={2.5} />}
                </span>
                <span>{req.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}