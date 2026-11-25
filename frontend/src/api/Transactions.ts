import { apiClient } from "./Client";
import { ApiSuccess, PaginatedResponse } from "@/types/Api";
import {
  Transaction,
  CreateTransactionPayload,
  CreateTransactionResult,
  EmailTransactionConfirmation,
  EmailTransactionConfirmationResult,
  TransactionFilters,
  TransactionArchivePreparation,
  TransactionArchivePurgeResult,
} from "@/types/Transaction";

export const TransactionsApi = {
  getAll: async (
    filters: TransactionFilters = {},
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<
      ApiSuccess<PaginatedResponse<Transaction>>
    >("/transactions", {
      params: filters,
    });
    return response.data.data;
  },

  getById: async (id: number): Promise<Transaction> => {
    const response = await apiClient.get<ApiSuccess<Transaction>>(
      `/transactions/${id}`,
    );
    return response.data.data;
  },

  create: async (
    payload: CreateTransactionPayload,
  ): Promise<CreateTransactionResult> => {
    const response = await apiClient.post<ApiSuccess<CreateTransactionResult>>(
      "/transactions",
      payload,
    );
    return response.data.data;
  },

  updateStatus: async (
    id: number,
    estado: "CONFIRMADA" | "RECHAZADA",
  ): Promise<Transaction> => {
    const response = await apiClient.patch<ApiSuccess<Transaction>>(
      `/transactions/${id}/status`,
      { estado },
    );
    return response.data.data;
  },

  updateCategory: async (
    id: number,
    id_categoria: number | null,
  ): Promise<Transaction> => {
    const response = await apiClient.patch<ApiSuccess<Transaction>>(
      `/transactions/${id}/category`,
      { id_categoria },
    );
    return response.data.data;
  },

  prepareArchive: async (): Promise<TransactionArchivePreparation> => {
    const response = await apiClient.post<
      ApiSuccess<TransactionArchivePreparation>
    >("/transactions/archive/prepare");
    return response.data.data;
  },

  downloadArchive: async (exportId: number): Promise<Blob> => {
    const response = await apiClient.post<Blob>(
      `/transactions/archive/${exportId}/download`,
      {},
      { responseType: "blob" },
    );
    return response.data;
  },

  purgeArchive: async (
    exportId: number,
  ): Promise<TransactionArchivePurgeResult> => {
    const response = await apiClient.post<
      ApiSuccess<TransactionArchivePurgeResult>
    >(`/transactions/archive/${exportId}/purge`);
    return response.data.data;
  },

  getEmailConfirmation: async (
    token: string,
  ): Promise<EmailTransactionConfirmation> => {
    const response = await apiClient.get<
      ApiSuccess<EmailTransactionConfirmation>
    >("/transactions/email-confirmation", { params: { token } });
    return response.data.data;
  },

  resolveEmailConfirmation: async (
    token: string,
    decision: "FUI_YO" | "NO_FUI_YO",
  ): Promise<EmailTransactionConfirmationResult> => {
    const response = await apiClient.post<
      ApiSuccess<EmailTransactionConfirmationResult>
    >("/transactions/email-confirmation", { token, decision });
    return response.data.data;
  },
};
