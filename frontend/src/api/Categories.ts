import { apiClient } from "./Client";
import { ApiSuccess } from "@/types/Api";
import {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/Category";

export const CategoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiSuccess<Category[]>>("/categories");
    return response.data.data;
  },

  create: async (payload: CreateCategoryPayload): Promise<Category> => {
    const response = await apiClient.post<ApiSuccess<Category>>(
      "/categories",
      payload,
    );
    return response.data.data;
  },

  update: async (
    id: number,
    payload: UpdateCategoryPayload,
  ): Promise<Category> => {
    const response = await apiClient.patch<ApiSuccess<Category>>(
      `/categories/${id}`,
      payload,
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<{ id_categoria: number }> => {
    const response = await apiClient.delete<
      ApiSuccess<{ id_categoria: number }>
    >(`/categories/${id}`);
    return response.data.data;
  },
};
