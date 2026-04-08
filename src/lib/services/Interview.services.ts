import { axiosInstance } from "../api/axiosInstance";
import { ENDPOINTS } from "../api/apiEndpoints";

export const interviewServices = {
  getMy: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    jobId?: string;
    companyId?: string;
  }) => {
    const response = await axiosInstance.get(ENDPOINTS.interview.getMy, {
      params,
    });
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    jobId?: string;
    companyId?: string;
    applicationId?: string;
  }) => {
    const response = await axiosInstance.get(ENDPOINTS.interview.getAll, {
      params,
    });
    return response.data;
  },

  getDetails: async (token: string) => {
    const endpoint = ENDPOINTS.interview.getDetails.replace(":token", token);
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  getById: async (interviewId: string) => {
    const endpoint = ENDPOINTS.interview.getById.replace(
      ":interviewId",
      interviewId,
    );
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  startConversation: async (token: string) => {
    const endpoint = ENDPOINTS.interview.conversation.replace(":token", token);
    const response = await axiosInstance.post(endpoint);
    return response.data;
  },

  sendMessage: async (token: string, message: string) => {
    const endpoint = ENDPOINTS.interview.conversation.replace(":token", token);
    const response = await axiosInstance.post(endpoint, { message });
    return response.data;
  },

  endInterview: async (token: string) => {
    const endpoint = ENDPOINTS.interview.end.replace(":token", token);
    const response = await axiosInstance.post(endpoint);
    return response.data;
  },

  // Calls the backend TTS proxy (Groq) and returns the audio as a Blob.
  // The API key is kept server-side; only the audio binary reaches the browser.
  getTTS: async (token: string, text: string): Promise<Blob> => {
    const endpoint = ENDPOINTS.interview.tts.replace(":token", token);
    try {
      const response = await axiosInstance.post(
        endpoint,
        { text },
        { responseType: "blob" },
      );
      return response.data;
    } catch (err: unknown) {
      // With responseType "blob", error response body is a Blob — parse it
      const axiosErr = err as {
        response?: { data?: Blob; status?: number };
      };
      if (axiosErr?.response?.data instanceof Blob) {
        try {
          const text = await axiosErr.response.data.text();
          const json = JSON.parse(text);
          throw { response: { data: json, status: axiosErr.response.status } };
        } catch (parseErr) {
          if ((parseErr as { response?: unknown })?.response) throw parseErr;
        }
      }
      throw err;
    }
  },
};
