export interface DashboardData {
  saldo_total: number;
  periodo: {
    dias: number;
    fecha_inicio: string;
    fecha_fin: string;
    ingresos: number;
    gastos: number;
    ahorros: number;
    balance_neto: number;
  };
  alertas: {
    activas: number;
    criticas: number;
  };
}

export interface DashboardAlert {
  id_alerta: number;
  id_transaccion: number;
  severidad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
  fecha_detectada: string;
  motivo: string;
  estado: "PENDIENTE" | "CONFIRMADA" | "DESCARTADA";
  monto: number;
  comercio: string | null;
  estado_transaccion: string;
}

export interface DashboardRecentTransaction {
  id_transaccion: number;
  monto: number;
  tipo_movimiento: "INGRESO" | "GASTO" | "AHORRO" | "TRANSFERENCIA";
  fecha_transaccion: string;
  comercio: string | null;
  estado: string;
  score_anomalia: number;
  nivel_riesgo: "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
  categoria: {
    nombre: string;
    icono: string | null;
    color: string | null;
  };
}

export interface FinancialAdvice {
  id_consejo: number;
  tipo: string;
  titulo: string;
  descripcion: string;
  prioridad: "BAJA" | "MEDIA" | "ALTA";
  fecha_generado: string;
}

export interface FinancialAdviceReadResult {
  id_consejo: number;
  leido: boolean;
  fecha_leido: string | null;
}

export interface CategoryExpense {
  id_categoria: number | null;
  nombre_categoria: string;
  total: number;
  porcentaje: number;
  color?: string | null;
}

export interface DashboardViewData {
  metrics: DashboardData;
  recentAlerts: DashboardAlert[];
  recentTransactions: DashboardRecentTransaction[];
  categories: CategoryExpense[];
  advice: FinancialAdvice[];
}
