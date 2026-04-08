"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextInput } from "@/components/global/FormFields";
import { Button } from "@/components/ui/button";
import { authServices } from "@/lib/services/Auth.services";
import { toast } from "sonner";
import { ForgotPasswordRequestSchema } from "@/lib/schema/Auth.schema";
import { ArrowLeft, Mail } from "lucide-react";

// Type for API error responses
type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

/**
 * Forgot Password Page
 *
 * This page handles the first step of password recovery.
 * Flow:
 * 1. User enters their email address
 * 2. System sends OTP to email
 * 3. User is redirected to reset password page with OTP verification
 *
 * The OTP is shown in a toast for development purposes.
 */
export default function ForgotPassword() {
  const router = useRouter();

  // State management
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Validates email field when user leaves it
   */
  const validateField = () => {
    const result = ForgotPasswordRequestSchema.safeParse({ email });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setError(fieldErrors.email?.[0] || "Invalid email");
    } else {
      setError("");
    }
  };

  /**
   * Handles email input change
   * Clears error when user starts typing
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  /**
   * Handles forgot password submission
   * Sends OTP to user's email and redirects to reset page
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const result = ForgotPasswordRequestSchema.safeParse({ email });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setError(fieldErrors.email?.[0] || "Invalid email");
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);

      // Call forgot password API
      const response = await authServices.forgotPassword({ email });

      // Show OTP in toast for development
      toast.success(`Password reset code sent! OTP: ${response.data.otp}`, {
        duration: 10000,
      });

      // Redirect to reset password page with email
      router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      console.error("Forgot Password Error:", error);

      const errorMessage =
        (error as ApiError).response?.data?.message ||
        "Failed to send reset code. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-8">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to login
        </Link>

        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 text-center">
          Forgot your password?
        </h1>
        <p className="text-muted-foreground text-center">
          No worries! Enter your email and we&apos;ll send you a reset code.
        </p>
      </div>

      {/* Email Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={handleEmailChange}
          onBlur={validateField}
          error={error}
          required
          autoComplete="email"
          autoFocus
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending code..." : "Send Reset Code"}
        </Button>
      </form>

      {/* Additional Help */}
      <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
        <p className="text-sm text-muted-foreground">
          <strong>Development Mode:</strong> The password reset code will be
          displayed in a notification. In production, this would be sent to your
          email address.
        </p>
      </div>

      {/* Back to Login Link */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-primary hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
