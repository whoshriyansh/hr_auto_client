import { axiosInstance } from "../api/axiosInstance";
import { ENDPOINTS } from "../api/apiEndpoints";

export type AiInterviewSettings = {
  maxQuestions: number;
  timeLimitMinutes: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  behaviour: string;
  customPrompt: string;
  followUpEnabled: boolean;
  maxFollowUps: number;
};

export type AiResumeAnalyserSettings = {
  strictness: "lenient" | "moderate" | "strict";
  minimumMatchScore: number;
  customPrompt: string;
};

export type AiFinalAnalyserSettings = {
  autoReject: boolean;
  autoRejectThreshold: number;
  autoShortlistThreshold: number;
  customPrompt: string;
};

export type AiSettingsPayload = {
  interview?: Partial<AiInterviewSettings>;
  resumeAnalyser?: Partial<AiResumeAnalyserSettings>;
  finalAnalyser?: Partial<AiFinalAnalyserSettings>;
};

export const aiSettingsServices = {
  get: async () => {
    const response = await axiosInstance.get(ENDPOINTS.aiSettings.get);
    return response.data;
  },

  upsert: async (payload: AiSettingsPayload) => {
    const response = await axiosInstance.put(
      ENDPOINTS.aiSettings.upsert,
      payload,
    );
    return response.data;
  },

  delete: async () => {
    const response = await axiosInstance.delete(ENDPOINTS.aiSettings.delete);
    return response.data;
  },
};
