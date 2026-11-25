import { apiClient } from "./Client";
import { ApiSuccess } from "@/types/Api";
import {
  CategoryExpense,
  DashboardAlert,
  DashboardData,
  DashboardRecentTransaction,
  FinancialAdvice,
  FinancialAdviceReadResult,
} from "@/types/Dashboard";

interface ApiCategoryReport {
  categorias: Array<{
    id_categoria: number | null;
    nombre: string;
    total: number;
  }>;
}

export const DashboardApi = {
  getStats: async (
    id_cuenta?: number,
    periodo_dias = 30,
  ): Promise<DashboardData> => {
    const response = await apiClient.get<ApiSuccess<DashboardData>>(
      "/dashboard/stats",
      { params: { id_cuenta, periodo_dias } },
    );
    return response.data.data;
  },

  getRecentAlerts: async (id_cuenta?: number): Promise<DashboardAlert[]> => {
    const response = await apiClient.get<ApiSuccess<DashboardAlert[]>>(
      "/dashboard/recent-alerts",
      { params: id_cuenta ? { id_cuenta } : undefined },
    );
    return response.data.data;
  },

  getRecentTransactions: async (
    id_cuenta?: number,
  ): Promise<DashboardRecentTransaction[]> => {
    const response = await apiClient.get<
      ApiSuccess<DashboardRecentTransaction[]>
    >("/dashboard/recent-transactions", {
      params: id_cuenta ? { id_cuenta } : undefined,
    });
    return response.data.data;
  },

  getCategoryExpenses: async (
    id_cuenta?: number,
    periodo?: Pick<DashboardData["periodo"], "fecha_inicio" | "fecha_fin">,
  ): Promise<CategoryExpense[]> => {
    const response = await apiClient.get<ApiSuccess<ApiCategoryReport>>(
      "/reports/by-category",
      {
        params: {
          tipo_movimiento: "GASTO",
          id_cuenta,
          fecha_inicio: periodo?.fecha_inicio,
          fecha_fin: periodo?.fecha_fin,
        },
      },
    );
    const categories = response.data.data.categorias;
    const total = categories.reduce((sum, category) => sum + category.total, 0);
    return categories.map((category) => ({
      id_categoria: category.id_categoria,
      nombre_categoria: category.nombre,
      total: category.total,
      porcentaje: total > 0 ? (category.total / total) * 100 : 0,
    }));
  },

  getAdvice: async (id_cuenta?: number): Promise<FinancialAdvice[]> => {
    const response =
      await apiClient.get<ApiSuccess<FinancialAdvice[]>>("/dashboard/advice", {
        params: id_cuenta ? { id_cuenta } : undefined,
      });
    return response.data.data;
  },

  markAdviceRead: async (id: number): Promise<FinancialAdviceReadResult> => {
    const response = await apiClient.patch<
      ApiSuccess<FinancialAdviceReadResult>
    >(`/dashboard/advice/${id}/read`);
    return response.data.data;
  },
};
