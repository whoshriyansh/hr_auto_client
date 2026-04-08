import { axiosInstance } from "../api/axiosInstance";
import { ENDPOINTS } from "../api/apiEndpoints";

export const dashboardServices = {
  getCompanyDashboard: async () => {
    const response = await axiosInstance.get(ENDPOINTS.dashboard.company);
    return response.data;
  },

  getApplicationStats: async () => {
    const response = await axiosInstance.get(
      ENDPOINTS.applicationStats.company,
    );
    return response.data;
  },

  getInterviewStats: async () => {
    const response = await axiosInstance.get(ENDPOINTS.interviewStats.company);
    return response.data;
  },
};
