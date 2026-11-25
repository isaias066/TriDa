import { apiClient } from "./Client";
import type { ApiSuccess, FinancialReportData, ReportFilters } from "@/types";

interface ApiReportSummary {
  periodo: { fecha_inicio: string; fecha_fin: string };
  totales: {
    ingresos: number;
    gastos: number;
    ahorros: number;
    balance: number;
  };
}

interface ApiCategoryReport {
  categorias: Array<{
    id_categoria: number | null;
    nombre: string;
    icono: string | null;
    color: string | null;
    total: number;
    cantidad: number;
  }>;
}

interface ApiTransactionReport {
  items: FinancialReportData["transacciones"];
  top_comercios: FinancialReportData["top_comercios"];
  total: number;
  truncated: boolean;
}

export const reportsApi = {
  getFinancialReport: async (
    filters: ReportFilters,
  ): Promise<FinancialReportData> => {
    const params = {
      fecha_inicio: filters.fecha_inicio,
      fecha_fin: filters.fecha_fin,
      id_cuenta: filters.id_cuenta,
    };
    const [
      summaryResponse,
      expenseResponse,
      incomeResponse,
      transactionResponse,
    ] = await Promise.all([
      apiClient.get<ApiSuccess<ApiReportSummary>>("/reports/summary", {
        params,
      }),
      apiClient.get<ApiSuccess<ApiCategoryReport>>("/reports/by-category", {
        params: { ...params, tipo_movimiento: "GASTO" },
      }),
      apiClient.get<ApiSuccess<ApiCategoryReport>>("/reports/by-category", {
        params: { ...params, tipo_movimiento: "INGRESO" },
      }),
      apiClient.get<ApiSuccess<ApiTransactionReport>>("/reports/transactions", {
        params: { ...params, limit: 5000 },
      }),
    ]);

    const summary = summaryResponse.data.data;
    const gastos = expenseResponse.data.data.categorias;
    const ingresos = incomeResponse.data.data.categorias;
    const transacciones = transactionResponse.data.data.items;
    const gastoTotal = summary.totales.gastos;
    const ingresoTotal = summary.totales.ingresos;

    const mapCategories = (
      categories: ApiCategoryReport["categorias"],
      total: number,
      tipo: "INGRESO" | "GASTO",
    ) =>
      categories.map((category) => ({
        id_categoria: category.id_categoria,
        nombre: category.nombre,
        tipo,
        total: category.total,
        porcentaje: total > 0 ? (category.total / total) * 100 : 0,
        numero_transacciones: category.cantidad,
        color: category.color,
      }));

    return {
      resumen: {
        total_ingresos: ingresoTotal,
        total_gastos: gastoTotal,
        balance_neto: summary.totales.balance,
        tasa_ahorro:
          ingresoTotal > 0 ? (summary.totales.ahorros / ingresoTotal) * 100 : 0,
      },
      gastos_por_categoria: mapCategories(gastos, gastoTotal, "GASTO"),
      ingresos_por_categoria: mapCategories(ingresos, ingresoTotal, "INGRESO"),
      top_comercios: transactionResponse.data.data.top_comercios.map(
        (merchant) => ({
          ...merchant,
          porcentaje: gastoTotal > 0 ? (merchant.total / gastoTotal) * 100 : 0,
        }),
      ),
      transacciones,
      total_transacciones: transactionResponse.data.data.total,
      transacciones_truncadas: transactionResponse.data.data.truncated,
      periodo: summary.periodo,
    };
  },
};
