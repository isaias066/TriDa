import { apiClient } from "./Client";
import type {
  ApiSuccess,
  SavingsGoal,
  CreateSavingsGoalPayload,
  UpdateSavingsGoalPayload,
  CreateContributionPayload,
} from "@/types";

export const savingsApi = {
  getGoals: async (): Promise<SavingsGoal[]> => {
    const response = await apiClient.get<ApiSuccess<SavingsGoal[]>>("/savings");
    return response.data.data;
  },

  createGoal: async (
    payload: CreateSavingsGoalPayload,
  ): Promise<SavingsGoal> => {
    const response = await apiClient.post<ApiSuccess<SavingsGoal>>(
      "/savings",
      payload,
    );
    return response.data.data;
  },

  updateGoal: async (
    id: number,
    payload: UpdateSavingsGoalPayload,
  ): Promise<SavingsGoal> => {
    const response = await apiClient.patch<ApiSuccess<SavingsGoal>>(
      `/savings/${id}`,
      payload,
    );
    return response.data.data;
  },

  deleteGoal: async (id: number): Promise<{ id_meta: number }> => {
    const response = await apiClient.delete<ApiSuccess<{ id_meta: number }>>(
      `/savings/${id}`,
    );
    return response.data.data;
  },

  addContribution: async (
    payload: CreateContributionPayload,
  ): Promise<SavingsGoal> => {
    const response = await apiClient.post<ApiSuccess<SavingsGoal>>(
      `/savings/${payload.id_meta}/funds`,
      { monto: payload.monto },
    );
    return response.data.data;
  },
};
