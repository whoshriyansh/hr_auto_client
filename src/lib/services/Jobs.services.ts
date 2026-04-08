import { axiosInstance } from "../api/axiosInstance";
import { ENDPOINTS } from "../api/apiEndpoints";
import type {
  CreateJobRequest,
  CreateJobAIRequest,
} from "../schema/Jobs.schema";

export const jobServices = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    skills?: string;
    experienceLevel?: string;
    workType?: string;
  }) => {
    const response = await axiosInstance.get(ENDPOINTS.job.getAll, { params });
    return response.data;
  },

  getMyJobs: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    skills?: string;
    experienceLevel?: string;
    workType?: string;
  }) => {
    const response = await axiosInstance.get(ENDPOINTS.job.getMyJobs, {
      params,
    });
    return response.data;
  },

  stats: async () => {
    const response = await axiosInstance.get(ENDPOINTS.job.stats);
    return response.data;
  },

  singleStats: async (jobId: string) => {
    const endpoint = ENDPOINTS.job.singleStats.replace(":jobId", jobId);
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  create: async (payload: CreateJobRequest) => {
    const response = await axiosInstance.post(ENDPOINTS.job.create, payload);
    return response.data;
  },

  createWithAI: async (payload: CreateJobAIRequest) => {
    const response = await axiosInstance.post(
      ENDPOINTS.job.createWithAI,
      payload,
    );
    return response.data;
  },

  get: async (jobId: string) => {
    const endpoint = ENDPOINTS.job.get.replace(":jobId", jobId);
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  update: async (jobId: string, payload: Partial<CreateJobRequest>) => {
    const endpoint = ENDPOINTS.job.update.replace(":jobId", jobId);
    const response = await axiosInstance.put(endpoint, payload);
    return response.data;
  },

  delete: async (jobId: string) => {
    const endpoint = ENDPOINTS.job.delete.replace(":jobId", jobId);
    const response = await axiosInstance.delete(endpoint);
    return response.data;
  },
};
