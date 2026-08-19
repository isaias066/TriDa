// ¿Qué? Barrel export que centraliza todos los componentes shared del sistema.
// ¿Para qué? Permitir importar múltiples componentes desde una sola ruta
//            (@components/shared) en vez de tener que importar de cada archivo.
// ¿Impacto? Simplifica los imports en páginas, layouts y otros módulos.
//           Si un componente se mueve de archivo, solo se actualiza esta re-exportación.

// ==============================================================================
// BADGES ESPECIALIZADOS
// ==============================================================================

export { RiskBadge } from './RiskBadge';
export type {
  RiskBadgeProps,
  RiskBadgeMode,
} from './RiskBadge';

export { BankBadge } from './BankBadge';
export type { BankBadgeProps } from './BankBadge';

export { StatusBadge } from './StatusBadge';
export type {
  StatusBadgeProps,
  StatusType,
} from './StatusBadge';

// ==============================================================================
// USUARIOS
// ==============================================================================

export {
  UserAvatar,
  AvatarGroup,
} from './UserAvatar';
export type {
  UserAvatarProps,
  UserAvatarSize,
  UserAvatarStatus,
  AvatarGroupProps,
} from './UserAvatar';

// ==============================================================================
// VISUALIZACIÓN
// ==============================================================================

export { ScoreRing } from './ScoreRing';
export type {
  ScoreRingProps,
  ScoreRingSize,
} from './ScoreRing';

// ==============================================================================
// INPUTS ESPECIALIZADOS
// ==============================================================================

export { SearchInput } from './SearchInput';
export type { SearchInputProps } from './SearchInput';

export { FilterChip } from './FilterChip';
export type {
  FilterChipProps,
  FilterChipSize,
} from './FilterChip';

// ==============================================================================
// NAVEGACIÓN Y DATOS
// ==============================================================================

export { Pagination } from './Pagination';
export type {
  PaginationProps,
  PaginationMode,
} from './Pagination';

export { DataTable } from './DataTable';
export type {
  DataTableProps,
  DataTableColumn,
  SortConfig,
  SortDirection,
} from './DataTable';

// ==============================================================================
// PANEL DE DETALLE
// ==============================================================================

export {
  DetailPanel,
  DetailField,
  DetailGrid,
  DetailSection,
  DetailDivider,
} from './DetailPanel';
export type {
  DetailPanelProps,
  DetailPanelSize,
  DetailPanelPosition,
  DetailFieldProps,
  DetailGridProps,
  DetailSectionProps,
} from './DetailPanel';

// ==============================================================================
// EXPORTACIÓN
// ==============================================================================

export { ExportButton } from './ExportButton';
export type {
  ExportButtonProps,
  ExportOption,
} from './ExportButton';

export { ExportPreviewModal } from './ExportPreviewModal';
export type { ExportPreviewModalProps } from './ExportPreviewModal';

// ==============================================================================
// DIÁLOGOS
// ==============================================================================

export { ConfirmDialog } from './ConfirmDialog';
export type {
  ConfirmDialogProps,
  ConfirmDialogVariant,
} from './ConfirmDialog';

// ==============================================================================
// PROTECCIÓN DE RUTAS
// ==============================================================================

export { ProtectedRoute } from './ProtectedRoute';
export type { ProtectedRouteProps } from './ProtectedRoute';