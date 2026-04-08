import { axiosInstance } from "../api/axiosInstance";
import { ENDPOINTS } from "../api/apiEndpoints";

export const skillsServices = {
  getAll: async () => {
    const response = await axiosInstance.get(ENDPOINTS.skills.getAll);
    return response.data;
  },
};
