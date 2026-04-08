"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthProvider";
import {
  TextInput,
  PasswordInput,
  OTPInputField,
} from "@/components/global/FormFields";
import { Button } from "@/components/ui/button";
import { authServices } from "@/lib/services/Auth.services";
import { toast } from "sonner";
import { z } from "zod";
import { Mail } from "lucide-react";

// Type for API error responses
type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const RegisterFormSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Register() {
  const [step, setStep] = useState<"register" | "verify">("register");

  // Register form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // OTP verify state
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { setToken } = useAuth();
  const router = useRouter();
  // Store the token locally until OTP verification completes
  const pendingTokenRef = useRef<string | null>(null);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((n) => n - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-submit when OTP reaches 6 digits
  useEffect(() => {
    if (otp.length === 6 && step === "verify") {
      handleVerifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const validateField = (field: keyof typeof formData) => {
    const result = RegisterFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const msg = fieldErrors[field]?.[0];
      if (msg) setErrors((prev) => ({ ...prev, [field]: msg }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const result = RegisterFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const newErrors: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([key, val]) => {
        if (Array.isArray(val)) newErrors[key] = val[0] as string;
      });
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      const response = await authServices.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "admin",
      });

      // Save token for later — don't persist until email is verified
      pendingTokenRef.current = response.data.token;

      // Show OTP in toast for testing
      toast.success(`OTP sent to ${formData.email}! Check your inbox.`, {
        duration: 10000,
      });

      // Switch to OTP verification step
      setCanResend(false);
      setResendTimer(60);
      setStep("verify");
    } catch (error: unknown) {
      const msg =
        (error as ApiError).response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit code");
      return;
    }
    setOtpError("");
    try {
      setIsVerifying(true);
      await authServices.verifyEmail({ email: formData.email, otp });
      toast.success("Email verified successfully!");

      // Now persist the token (user is verified)
      if (pendingTokenRef.current) {
        localStorage.setItem("hr_auto_token", pendingTokenRef.current);
        setToken(pendingTokenRef.current);
      }

      router.push("/register/create-company");
    } catch (error: unknown) {
      const msg =
        (error as ApiError).response?.data?.message ||
        "Invalid OTP. Please try again.";
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      setCanResend(false);
      setResendTimer(60);
      await authServices.resendOtp({ email: formData.email });
      toast.success(`New OTP sent to ${formData.email}! Check your inbox.`, {
        duration: 10000,
      });
    } catch (error: unknown) {
      const msg =
        (error as ApiError).response?.data?.message || "Failed to resend OTP.";
      toast.error(msg);
      setCanResend(true);
      setResendTimer(0);
    }
  };

  // ── OTP Step ──────────────────────────────────────────────────────────────
  if (step === "verify") {
    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-center">
            Verify your email
          </h1>
          <p className="text-muted-foreground text-center text-sm">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">
              {formData.email}
            </span>
          </p>
        </div>

        <div className="space-y-6">
          <OTPInputField
            label="Verification code"
            value={otp}
            onChange={(val) => {
              setOtp(val);
              if (otpError) setOtpError("");
            }}
            length={6}
            error={otpError}
            description="Enter the 6-digit code from your email"
            disabled={isVerifying}
          />

          <Button
            className="w-full"
            onClick={handleVerifyOtp}
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Didn&apos;t receive the code?{" "}
            <button
              onClick={handleResendOtp}
              disabled={!canResend}
              className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {canResend ? "Resend code" : `Resend in ${resendTimer}s`}
            </button>
          </div>

          <button
            onClick={() => {
              setStep("register");
              setOtp("");
              setOtpError("");
            }}
            className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
          >
            ← Back to registration
          </button>
        </div>
      </div>
    );
  }

  // ── Register Step ─────────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Create your account</h1>
        <p className="text-muted-foreground">
          Start your free trial. No credit card required.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <TextInput
          id="name"
          label="Full Name"
          placeholder="John Smith"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => validateField("name")}
          error={errors.name}
          required
          autoComplete="name"
        />

        <TextInput
          id="email"
          label="Work Email"
          type="email"
          placeholder="you@company.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => validateField("email")}
          error={errors.email}
          required
          autoComplete="email"
        />

        <PasswordInput
          id="password"
          label="Password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          onBlur={() => validateField("password")}
          error={errors.password}
          description="Must be at least 8 characters"
          required
          autoComplete="new-password"
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          onBlur={() => validateField("confirmPassword")}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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
