"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput, OTPInputField } from "@/components/global/FormFields";
import { Button } from "@/components/ui/button";
import { authServices } from "@/lib/services/Auth.services";
import { toast } from "sonner";
import { ResetPasswordRequestSchema } from "@/lib/schema/Auth.schema";
import { ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

// Type for API error responses
type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

/**
 * Extended schema for reset password form validation
 * Includes confirmPassword field for client-side validation
 */
const ResetPasswordFormSchema = ResetPasswordRequestSchema.extend({
  confirmPassword: z.string(),
})
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword.length >= 8, {
    message: "Password must be at least 8 characters",
    path: ["newPassword"],
  });

/**
 * Reset Password Page
 *
 * This page handles the second step of password recovery.
 * Flow:
 * 1. User receives OTP from forgot password page
 * 2. User enters OTP and new password
 * 3. Password is reset and user is redirected to login
 *
 * Features:
 * - OTP verification
 * - Password confirmation matching
 * - Real-time validation
 * - Auto-submit when OTP is complete
 */
export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get email from query params
  const email = searchParams.get("email") || "";

  // Form state
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validates a specific field using Zod schema
   */
  const validateField = (field: "otp" | "newPassword" | "confirmPassword") => {
    const formData = {
      email,
      otp,
      newPassword,
      confirmPassword,
    };

    const result = ResetPasswordFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const errorMessage = fieldErrors[field]?.[0];

      if (errorMessage) {
        setErrors((prev) => ({
          ...prev,
          [field]: errorMessage,
        }));
      }
    } else {
      // Clear error if validation passes
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  /**
   * Handles OTP input change
   * Clears error when user starts typing
   */
  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  /**
   * Handles password input changes
   * Clears errors when user starts typing
   */
  const handlePasswordChange =
    (field: "newPassword" | "confirmPassword") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (field === "newPassword") {
        setNewPassword(value);
      } else {
        setConfirmPassword(value);
      }

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  /**
   * Validates all fields before submission
   */
  const validate = (): boolean => {
    const formData = {
      email,
      otp,
      newPassword,
      confirmPassword,
    };

    const result = ResetPasswordFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const newErrors: Record<string, string> = {};

      Object.keys(fieldErrors).forEach((key) => {
        const error = fieldErrors[key as keyof typeof fieldErrors];
        if (Array.isArray(error)) {
          newErrors[key] = error[0] as string;
        }
      });

      setErrors(newErrors);
      return false;
    }

    return true;
  };

  /**
   * Handles password reset submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      setIsLoading(true);

      // Call reset password API
      await authServices.resetPassword({
        email,
        otp,
        newPassword,
      });

      toast.success("Password reset successful! You can now log in.");

      // Redirect to login page
      router.push("/login");
    } catch (error: unknown) {
      console.error("Reset Password Error:", error);

      const errorMessage =
        (error as ApiError).response?.data?.message ||
        "Failed to reset password. Please try again.";
      toast.error(errorMessage);

      // Set error on OTP field if invalid
      setErrors((prev) => ({
        ...prev,
        otp: "Invalid or expired code",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles resending OTP
   */
  const handleResendOtp = async () => {
    try {
      const response = await authServices.forgotPassword({ email });

      toast.success(`New reset code sent! OTP: ${response.data.otp}`, {
        duration: 10000,
      });
    } catch (error: unknown) {
      console.error("Resend OTP Error:", error);

      const errorMessage =
        (error as ApiError).response?.data?.message ||
        "Failed to resend code. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-8">
        <Link
          href="/forgot-password"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Link>

        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 text-center">
          Reset your password
        </h1>
        <p className="text-muted-foreground text-center">
          Enter the code sent to
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      {/* Reset Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* OTP Input */}
        <OTPInputField
          label="Verification Code"
          value={otp}
          onChange={handleOtpChange}
          length={6}
          error={errors.otp}
          description="Enter the 6-digit code from your email"
          disabled={isLoading}
        />

        {/* New Password */}
        <PasswordInput
          id="newPassword"
          label="New Password"
          placeholder="••••••••"
          value={newPassword}
          onChange={handlePasswordChange("newPassword")}
          onBlur={() => validateField("newPassword")}
          error={errors.newPassword}
          description="Must be at least 8 characters"
          required
          autoComplete="new-password"
        />

        {/* Confirm Password */}
        <PasswordInput
          id="confirmPassword"
          label="Confirm New Password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={handlePasswordChange("confirmPassword")}
          onBlur={() => validateField("confirmPassword")}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Resetting password..." : "Reset Password"}
        </Button>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Didn&apos;t receive the code?
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleResendOtp}
            className="w-full"
          >
            Resend Code
          </Button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
        <p className="text-sm text-muted-foreground">
          <strong>Development Mode:</strong> The reset code was displayed in the
          notification. Check the toast or use the resend button to get a new
          code.
        </p>
      </div>
    </div>
  );
}
