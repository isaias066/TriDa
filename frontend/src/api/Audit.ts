import { apiClient } from "./Client";
import type { ApiSuccess } from "@/types/Api";
import type { AuditHistoryPage } from "@/types/Audit";

interface AuditHistoryQuery {
  limit?: number;
  before_id?: number;
}

export const AuditApi = {
  getMyHistory: async (
    query: AuditHistoryQuery = {},
  ): Promise<AuditHistoryPage> => {
    const response = await apiClient.get<ApiSuccess<AuditHistoryPage>>(
      "/audit",
      { params: query },
    );
    return response.data.data;
  },
};
