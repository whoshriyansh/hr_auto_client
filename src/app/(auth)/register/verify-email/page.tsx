"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OTPInputField } from "@/components/global/FormFields";
import { Button } from "@/components/ui/button";
import { authServices } from "@/lib/services/Auth.services";
import { toast } from "sonner";
import { VerifyEmailRequestSchema } from "@/lib/schema/Auth.schema";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Type for API error responses
type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

/**
 * Email Verification Page
 *
 * This page handles OTP verification after user registration.
 * Flow:
 * 1. User registers and receives OTP (shown in toast for development)
 * 2. User enters 6-digit OTP code
 * 3. On successful verification, redirects to company creation or dashboard
 *
 * Features:
 * - Automatic validation as user types
 * - Resend OTP functionality with cooldown timer
 * - Email displayed for user confirmation
 */
export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get email from query params (passed from registration)
  const email = searchParams.get("email") || "";

  // State management
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");

  /**
   * Countdown timer for resend OTP button
   * Prevents spam by enforcing 60 second cooldown
   */
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  /**
   * Automatically submit when OTP is complete (6 digits)
   */
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  /**
   * Handles OTP verification
   * Validates with Zod schema, calls API, and redirects on success
   */
  const handleVerify = async () => {
    // Clear any previous errors
    setError("");

    // Validate input with Zod
    const result = VerifyEmailRequestSchema.safeParse({ email, otp });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setError(fieldErrors.otp?.[0] || fieldErrors.email?.[0] || "Invalid OTP");
      toast.error("Invalid OTP code");
      return;
    }

    try {
      setIsLoading(true);

      // Call verify email API
      await authServices.verifyEmail({ email, otp });

      toast.success("Email verified successfully!");

      // Redirect to company creation for admin/team-member or dashboard for candidates
      // For now, always redirect to company creation
      router.push("/register/create-company");
    } catch (error: unknown) {
      console.error("Verification Error:", error);

      const errorMessage =
        (error as ApiError).response?.data?.message ||
        "Invalid OTP code. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles resending OTP
   * Implements cooldown to prevent spam
   */
  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      setIsResending(true);
      setCanResend(false);
      setResendTimer(60); // 60 second cooldown

      // Call resend OTP API
      const response = await authServices.resendOtp({ email });

      // Show OTP in toast for development
      toast.success(`New OTP sent! Code: ${response.data.otp}`, {
        duration: 10000,
      });
    } catch (error: unknown) {
      console.error("Resend OTP Error:", error);

      const errorMessage =
        (error as ApiError).response?.data?.message ||
        "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);

      // Reset timer on error
      setCanResend(true);
      setResendTimer(0);
    } finally {
      setIsResending(false);
    }
  };

  /**
   * Handles OTP input change
   * Clears error when user starts typing
   */
  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (error) {
      setError("");
    }
  };

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-8">
        <Link
          href="/register"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to registration
        </Link>

        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 text-center">
          Verify your email
        </h1>
        <p className="text-muted-foreground text-center">
          We&apos;ve sent a verification code to
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      {/* OTP Input Form */}
      <div className="space-y-6">
        <OTPInputField
          label="Enter verification code"
          value={otp}
          onChange={handleOtpChange}
          length={6}
          error={error}
          description="Enter the 6-digit code sent to your email"
          disabled={isLoading}
        />

        {/* Verify Button - only shown if OTP not complete */}
        {otp.length < 6 && (
          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={otp.length !== 6 || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        )}

        {/* Resend OTP Section */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Didn&apos;t receive the code?
          </p>
          <Button
            variant="outline"
            onClick={handleResendOtp}
            disabled={!canResend || isResending}
            className="w-full"
          >
            {isResending
              ? "Sending..."
              : canResend
                ? "Resend Code"
                : `Resend in ${resendTimer}s`}
          </Button>
        </div>

        {/* Help text */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <p className="text-sm text-muted-foreground">
            <strong>Development Mode:</strong> The OTP code was displayed in the
            notification when you registered. Check the toast notification or
            use the resend button to get a new code.
          </p>
        </div>
      </div>
    </div>
  );
}
