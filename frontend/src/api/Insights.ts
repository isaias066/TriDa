import { apiClient } from "./Client";
import type { ApiSuccess, InsightsOverview, MessageScanResult } from "@/types";

export const insightsApi = {
  getOverview: async (periodoDias = 30, idCuenta?: number): Promise<InsightsOverview> => {
    const response = await apiClient.get<ApiSuccess<InsightsOverview>>(
      "/insights",
      { params: { periodo_dias: periodoDias, id_cuenta: idCuenta } },
    );
    return response.data.data;
  },

  scanMessage: async (texto: string): Promise<MessageScanResult> => {
    const response = await apiClient.post<ApiSuccess<MessageScanResult>>(
      "/insights/scan-message",
      { texto },
    );
    return response.data.data;
  },
};
