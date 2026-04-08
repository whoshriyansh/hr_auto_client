import { axiosInstance } from "../api/axiosInstance";
import { ENDPOINTS } from "../api/apiEndpoints";

import {
  LoginRequest,
  LoginRequestSchema,
  LoginResponse,
  LoginResponseSchema,
  RegisterRequest,
  RegisterRequestSchema,
  RegisterResponse,
  RegisterResponseSchema,
  VerifyEmailRequest,
  VerifyEmailRequestSchema,
  VerifyEmailResponse,
  VerifyEmailResponseSchema,
  ResendOTPRequest,
  ResendOTPRequestSchema,
  ResendOTPResponse,
  ResendOTPResponseSchema,
  ForgotPasswordRequest,
  ForgotPasswordRequestSchema,
  ForgotPasswordResponse,
  ForgotPasswordResponseSchema,
  ResetPasswordRequest,
  ResetPasswordRequestSchema,
  ResetPasswordResponse,
  ResetPasswordResponseSchema,
  GetMeResponse,
  GetMeResponseSchema,
} from "../schema/Auth.schema";

export const authServices = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const validatedData = LoginRequestSchema.parse(payload);
    const response = await axiosInstance.post(
      ENDPOINTS.auth.login,
      validatedData,
    );
    const parsedResponse = LoginResponseSchema.parse(response.data);
    localStorage.setItem("hr_auto_token", parsedResponse.data.token);
    return parsedResponse;
  },

  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    const validatedData = RegisterRequestSchema.parse(payload);
    const response = await axiosInstance.post(
      ENDPOINTS.auth.register,
      validatedData,
    );
    const parsedResponse = RegisterResponseSchema.parse(response.data);
    // Don't store token here — let the register page handle it after OTP verification
    return parsedResponse;
  },

  verifyEmail: async (
    payload: VerifyEmailRequest,
  ): Promise<VerifyEmailResponse> => {
    const validatedData = VerifyEmailRequestSchema.parse(payload);
    const response = await axiosInstance.post(
      ENDPOINTS.auth.verifyEmail,
      validatedData,
    );
    return VerifyEmailResponseSchema.parse(response.data);
  },

  resendOtp: async (payload: ResendOTPRequest): Promise<ResendOTPResponse> => {
    const validatedData = ResendOTPRequestSchema.parse(payload);
    const response = await axiosInstance.post(
      ENDPOINTS.auth.resendOtp,
      validatedData,
    );
    return ResendOTPResponseSchema.parse(response.data);
  },

  forgotPassword: async (
    payload: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> => {
    const validatedData = ForgotPasswordRequestSchema.parse(payload);
    const response = await axiosInstance.post(
      ENDPOINTS.auth.forgotPassword,
      validatedData,
    );
    return ForgotPasswordResponseSchema.parse(response.data);
  },

  resetPassword: async (
    payload: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> => {
    const validatedData = ResetPasswordRequestSchema.parse(payload);
    const response = await axiosInstance.post(
      ENDPOINTS.auth.resetPassword,
      validatedData,
    );
    return ResetPasswordResponseSchema.parse(response.data);
  },

  getMe: async (): Promise<GetMeResponse> => {
    const response = await axiosInstance.get(ENDPOINTS.auth.getMe);
    return GetMeResponseSchema.parse(response.data);
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post(ENDPOINTS.auth.logout);
    } finally {
      localStorage.removeItem("hr_auto_token");
    }
  },
};
