// ¿Qué? Barrel export que centraliza todos los componentes UI base del design system.
// ¿Para qué? Permitir importar múltiples componentes desde una sola ruta (@components/ui)
//            en vez de tener que importar de cada archivo individualmente.
// ¿Impacto? Simplifica los imports en componentes especializados, layouts y páginas.
//           Si un componente se mueve de archivo, solo se actualiza esta re-exportación.

// ==============================================================================
// FEEDBACK Y ESTADO
// ==============================================================================

export { Spinner } from './Spinner';
export type {
  SpinnerProps,
  SpinnerSize,
  SpinnerVariant,
} from './Spinner';

export { EmptyState } from './EmptyState';
export type {
  EmptyStateProps,
  EmptyStatePreset,
  EmptyStateVariant,
} from './EmptyState';

// ==============================================================================
// FORMULARIOS
// ==============================================================================

export { Button } from './Button';
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
} from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Select } from './Select';
export type {
  SelectProps,
  SelectOption,
} from './Select';

export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

export { Toggle } from './Toggle';
export type {
  ToggleProps,
  ToggleSize,
  ToggleVariant,
} from './Toggle';

// ==============================================================================
// CONTENEDORES
// ==============================================================================

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from './Card';
export type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardVariant,
  CardPadding,
} from './Card';

export { Modal } from './Modal';
export type {
  ModalProps,
  ModalSize,
} from './Modal';

// ==============================================================================
// INDICADORES
// ==============================================================================

export { Badge } from './Badge';
export type {
  BadgeProps,
  BadgeVariant,
  BadgeSize,
} from './Badge';

export { Tooltip } from './Tooltip';
export type {
  TooltipProps,
  TooltipPosition,
  TooltipVariant,
} from './Tooltip';