import { axiosInstance } from "../api/axiosInstance";
import { ENDPOINTS } from "../api/apiEndpoints";
import type {
  ApiResponse,
  JoinWaitlistPayload,
  WaitlistEntry,
  PlatformConfig,
  CreatePaymentOrderResponse,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
} from "../types";

export const waitlistServices = {
  getPlatformConfig: async (): Promise<ApiResponse<PlatformConfig>> => {
    const response = await axiosInstance.get(ENDPOINTS.waitlist.platformConfig);
    return response.data;
  },

  join: async (
    payload: JoinWaitlistPayload,
  ): Promise<ApiResponse<{ entry: WaitlistEntry }>> => {
    const response = await axiosInstance.post(ENDPOINTS.waitlist.join, payload);
    return response.data;
  },

  checkEmail: async (
    email: string,
  ): Promise<ApiResponse<{ exists: boolean; entry: WaitlistEntry | null }>> => {
    const response = await axiosInstance.get(
      ENDPOINTS.waitlist.checkEmail.replace(
        ":email",
        encodeURIComponent(email),
      ),
    );
    return response.data;
  },

  createPaymentOrder: async (
    email: string,
  ): Promise<ApiResponse<CreatePaymentOrderResponse>> => {
    const response = await axiosInstance.post(ENDPOINTS.waitlist.createOrder, {
      email,
    });
    return response.data;
  },

  verifyPayment: async (
    payload: VerifyPaymentPayload,
  ): Promise<ApiResponse<VerifyPaymentResponse>> => {
    const response = await axiosInstance.post(
      ENDPOINTS.waitlist.verifyPayment,
      payload,
    );
    return response.data;
  },
};
