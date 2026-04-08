import { axiosInstance } from "../api/axiosInstance";
import { ENDPOINTS } from "../api/apiEndpoints";

export const applicationServices = {
  publicApply: async (formData: FormData) => {
    const response = await axiosInstance.post(
      ENDPOINTS.application.publicApply,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    jobId?: string;
    experienceLevel?: string;
    extractedSkills?: string;
    extractedExperience?: string;
    workType?: string;
    analysisResume?: string;
    aiScore?: number;
    jobRelevanceScore?: number;
    jobMatchScore?: number;
    status?: string;
  }) => {
    const response = await axiosInstance.get(ENDPOINTS.application.getAll, {
      params,
    });
    return response.data;
  },

  getByJob: async (
    jobId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
    },
  ) => {
    const endpoint = ENDPOINTS.application.getByJob.replace(":jobId", jobId);
    const response = await axiosInstance.get(endpoint, { params });
    return response.data;
  },

  get: async (applicationId: string) => {
    const endpoint = ENDPOINTS.application.get.replace(
      ":applicationId",
      applicationId,
    );
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  updateStatus: async (applicationId: string, status: string) => {
    const endpoint = ENDPOINTS.application.updateStatus.replace(
      ":applicationId",
      applicationId,
    );
    const response = await axiosInstance.put(endpoint, { status });
    return response.data;
  },

  shortlist: async (applicationId: string) => {
    const endpoint = ENDPOINTS.application.shortlist.replace(
      ":applicationId",
      applicationId,
    );
    const response = await axiosInstance.put(endpoint);
    return response.data;
  },

  delete: async (applicationId: string) => {
    const endpoint = ENDPOINTS.application.delete.replace(
      ":applicationId",
      applicationId,
    );
    const response = await axiosInstance.delete(endpoint);
    return response.data;
  },
};
