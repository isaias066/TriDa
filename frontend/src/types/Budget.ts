export interface BudgetCategoryInfo {
  nombre: string | null;
  icono?: string | null;
  color?: string | null;
}

export interface Budget {
  id_presupuesto: number;
  id_categoria: number | null;
  limite_mensual: number;
  mes: number;
  anio: number;
  fecha_creacion: string;
  gastado: number;
  categoria: BudgetCategoryInfo;
}

export interface CreateBudgetPayload {
  id_categoria: number;
  limite_mensual: number;
  mes: number;
  anio: number;
}

export interface UpdateBudgetPayload {
  limite_mensual: number;
}

export interface BudgetFilters {
  mes?: number;
  anio?: number;
  id_categoria?: number;
}

export interface BudgetSummary {
  total_presupuestado: number;
  total_gastado: number;
  porcentaje_total: number;
  presupuestos_en_alerta: number;
  presupuestos_excedidos: number;
  total_presupuestos: number;
}
