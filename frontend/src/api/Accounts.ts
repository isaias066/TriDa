/**
 * ¿Qué? Servicio API para la gestión de cuentas financieras del usuario.
 */
import { apiClient } from "./Client";
import { API_ENDPOINTS } from "@/constants/Api";
import {
  ApiSuccess,
  Account,
  CreateAccountPayload,
  UpdateAccountPayload,
} from "@/types";

export const AccountsApi = {
  /**
   * GET /api/v2/accounts
   */
  async getAccounts(): Promise<Account[]> {
    const response = await apiClient.get<ApiSuccess<Account[]>>(
      API_ENDPOINTS.ACCOUNTS,
    );
    return response.data.data;
  },

  /**
   * POST /api/v2/accounts
   */
  async createAccount(payload: CreateAccountPayload): Promise<Account> {
    const response = await apiClient.post<ApiSuccess<Account>>(
      API_ENDPOINTS.ACCOUNTS,
      payload,
    );
    return response.data.data;
  },

  /**
   * PATCH /api/v2/accounts/:id
   */
  async updateAccount(
    id_cuenta: number,
    payload: UpdateAccountPayload,
  ): Promise<Account> {
    const response = await apiClient.patch<ApiSuccess<Account>>(
      `${API_ENDPOINTS.ACCOUNTS}/${id_cuenta}`,
      payload,
    );
    return response.data.data;
  },

  /**
   * DELETE /api/v2/accounts/:id
   */
  async deleteAccount(id_cuenta: number): Promise<{ id_cuenta: number }> {
    const response = await apiClient.delete<ApiSuccess<{ id_cuenta: number }>>(
      `${API_ENDPOINTS.ACCOUNTS}/${id_cuenta}`,
    );
    return response.data.data;
  },
};
