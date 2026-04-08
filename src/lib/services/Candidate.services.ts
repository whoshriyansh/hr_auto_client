import { axiosInstance } from "../api/axiosInstance";
import { ENDPOINTS } from "../api/apiEndpoints";

export const candidateServices = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await axiosInstance.get(ENDPOINTS.candidate.getAll, {
      params,
    });
    return response.data;
  },

  get: async (id: string) => {
    const endpoint = ENDPOINTS.candidate.get.replace(":id", id);
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get(ENDPOINTS.candidate.getMe);
    return response.data;
  },

  create: async (payload: Record<string, unknown>) => {
    const response = await axiosInstance.post(
      ENDPOINTS.candidate.create,
      payload,
    );
    return response.data;
  },

  update: async (id: string, payload: Record<string, unknown>) => {
    const endpoint = ENDPOINTS.candidate.update.replace(":id", id);
    const response = await axiosInstance.put(endpoint, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const endpoint = ENDPOINTS.candidate.delete.replace(":id", id);
    const response = await axiosInstance.delete(endpoint);
    return response.data;
  },
};
