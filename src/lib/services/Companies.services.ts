import { axiosInstance } from "../api/axiosInstance";
import { ENDPOINTS } from "../api/apiEndpoints";
import type {
  GetMyCompanyResponse,
  GetCompanyResponse,
  GetAllCompaniesResponse,
} from "../schema/Companies.schema";

export const companyServices = {
  create: async (formData: FormData) => {
    const response = await axiosInstance.post(
      ENDPOINTS.company.create,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  getMy: async (): Promise<GetMyCompanyResponse> => {
    const response = await axiosInstance.get(ENDPOINTS.company.getMy);
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    size?: string;
  }): Promise<GetAllCompaniesResponse> => {
    const response = await axiosInstance.get(ENDPOINTS.company.getAll, {
      params,
    });
    return response.data;
  },

  get: async (companyId: string): Promise<GetCompanyResponse> => {
    const endpoint = ENDPOINTS.company.get.replace(":companyId", companyId);
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  update: async (companyId: string, formData: FormData) => {
    const endpoint = ENDPOINTS.company.update.replace(":companyId", companyId);
    const response = await axiosInstance.put(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  delete: async (companyId: string) => {
    const endpoint = ENDPOINTS.company.delete.replace(":companyId", companyId);
    const response = await axiosInstance.delete(endpoint);
    return response.data;
  },
};
