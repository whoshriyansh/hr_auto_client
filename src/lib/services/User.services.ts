import { axiosInstance } from "../api/axiosInstance";
import { ENDPOINTS } from "../api/apiEndpoints";

export const userServices = {
  getProfile: async () => {
    const response = await axiosInstance.get(ENDPOINTS.user.getMe);
    return response.data;
  },

  updateProfile: async (payload: { name?: string }) => {
    const response = await axiosInstance.put(ENDPOINTS.user.updateMe, payload);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await axiosInstance.delete(ENDPOINTS.user.deleteMe);
    return response.data;
  },
};
