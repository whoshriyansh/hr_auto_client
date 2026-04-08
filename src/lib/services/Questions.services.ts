import { axiosInstance } from "../api/axiosInstance";
import { ENDPOINTS } from "../api/apiEndpoints";
import type { CreateQuestionsRequest } from "../schema/Questions.schema";

export const questionServices = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    jobId?: string;
    difficulty?: string;
    experienceLevel?: string;
  }) => {
    const response = await axiosInstance.get(ENDPOINTS.questions.getAll, {
      params,
    });
    return response.data;
  },

  getByJob: async (
    jobId: string,
    params?: {
      page?: number;
      limit?: number;
    },
  ) => {
    const endpoint = ENDPOINTS.questions.getByJob.replace(":jobId", jobId);
    const response = await axiosInstance.get(endpoint, { params });
    return response.data;
  },

  get: async (questionId: string) => {
    const endpoint = ENDPOINTS.questions.get.replace(":questionId", questionId);
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  create: async (payload: CreateQuestionsRequest) => {
    const response = await axiosInstance.post(
      ENDPOINTS.questions.create,
      payload,
    );
    return response.data;
  },

  update: async (
    questionId: string,
    payload: Partial<
      CreateQuestionsRequest & {
        questions: { question: string; difficulty: string }[];
      }
    >,
  ) => {
    const endpoint = ENDPOINTS.questions.update.replace(
      ":questionId",
      questionId,
    );
    const response = await axiosInstance.put(endpoint, payload);
    return response.data;
  },

  delete: async (questionId: string) => {
    const endpoint = ENDPOINTS.questions.delete.replace(
      ":questionId",
      questionId,
    );
    const response = await axiosInstance.delete(endpoint);
    return response.data;
  },
};
