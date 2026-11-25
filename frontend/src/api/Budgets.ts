import { apiClient } from "./Client";
import type {
  ApiSuccess,
  Budget,
  BudgetFilters,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from "@/types";

export const budgetsApi = {
  getBudgets: async (
    filters: BudgetFilters & { id_cuenta?: number },
  ): Promise<Budget[]> => {
    const response = await apiClient.get<ApiSuccess<Budget[]>>("/budgets", {
      params: filters,
    });
    return response.data.data;
  },

  createBudget: async (payload: CreateBudgetPayload): Promise<Budget> => {
    const response = await apiClient.post<ApiSuccess<Budget>>(
      "/budgets",
      payload,
    );
    return response.data.data;
  },

  updateBudget: async (
    id: number,
    payload: UpdateBudgetPayload,
  ): Promise<Budget> => {
    const response = await apiClient.patch<ApiSuccess<Budget>>(
      `/budgets/${id}`,
      payload,
    );
    return response.data.data;
  },

  deleteBudget: async (id: number): Promise<{ id_presupuesto: number }> => {
    const response = await apiClient.delete<
      ApiSuccess<{ id_presupuesto: number }>
    >(`/budgets/${id}`);
    return response.data.data;
  },
};
