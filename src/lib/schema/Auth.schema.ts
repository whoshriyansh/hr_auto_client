import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["super-admin", "admin", "candidate"]),
  profileImage: z.string().optional().default(""),
  isEmailVerified: z.boolean(),
  lastLogin: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const LoginResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    user: UserSchema,
    token: z.string(),
  }),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
  role: z.enum(["admin", "candidate"]),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RegisterResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    user: UserSchema,
    token: z.string(),
    otp: z.string(),
  }),
});
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const VerifyEmailRequestSchema = z.object({
  email: z.string().email(),
  otp: z.string(),
});
export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;

export const VerifyEmailResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.any().optional(),
});
export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>;

export const ResendOTPRequestSchema = z.object({
  email: z.string().email(),
});
export type ResendOTPRequest = z.infer<typeof ResendOTPRequestSchema>;

export const ResendOTPResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    otp: z.string(),
  }),
});
export type ResendOTPResponse = z.infer<typeof ResendOTPResponseSchema>;

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ForgotPasswordResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    otp: z.string(),
  }),
});
export type ForgotPasswordResponse = z.infer<
  typeof ForgotPasswordResponseSchema
>;

export const ResetPasswordRequestSchema = z.object({
  email: z.string().email(),
  otp: z.string(),
  newPassword: z.string(),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export const ResetPasswordResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.null().optional(),
});
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;

// Get Me response (from /users/me)
export const GetMeResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    user: UserSchema,
    candidateProfile: z.any().nullable().optional(),
  }),
});
export type GetMeResponse = z.infer<typeof GetMeResponseSchema>;
