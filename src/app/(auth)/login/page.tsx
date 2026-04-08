"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthProvider";
import {
  TextInput,
  PasswordInput,
  CheckboxInput,
} from "@/components/global/FormFields";
import { Button } from "@/components/ui/button";
import { authServices } from "@/lib/services/Auth.services";
import { toast } from "sonner";
import { LoginRequestSchema } from "@/lib/schema/Auth.schema";

// Type for API error responses
type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function Login() {
  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for field-level errors
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const { setToken } = useAuth();
  const router = useRouter();

  /**
   * Validates a specific field using Zod schema
   * Shows error when user leaves the field (onBlur)
   */
  const validateField = (field: "email" | "password", value: string) => {
    // Create a partial validation object with current values
    const validationData = {
      email: field === "email" ? value : email,
      password: field === "password" ? value : password,
    };

    const result = LoginRequestSchema.safeParse(validationData);

    if (!result.success) {
      // Extract errors for the specific field
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors((prev) => ({
        ...prev,
        [field]: fieldErrors[field]?.[0],
      }));
    } else {
      // Clear error if validation passes
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  /**
   * Handles field change - clears error when user starts typing
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    // Clear error when user starts typing
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  /**
   * Handles form submission with full validation
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const result = LoginRequestSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      setIsLoading(true);
      const response = await authServices.login({ email, password });

      // Store token in auth context
      setToken(response.data.token);

      toast.success("Login successful!");
      router.push("/jobs");
    } catch (error: unknown) {
      console.error("Login Error:", error);

      // Show API error message
      const errorMessage =
        (error as ApiError).response?.data?.message ||
        "Invalid email or password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <TextInput
          id="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={handleEmailChange}
          onBlur={() => validateField("email", email)}
          error={errors.email}
          required
          autoComplete="email"
        />

        <PasswordInput
          id="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={handlePasswordChange}
          onBlur={() => validateField("password", password)}
          error={errors.password}
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <CheckboxInput
            id="remember"
            label="Remember me"
            checked={rememberMe}
            onCheckedChange={setRememberMe}
          />
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary hover:underline font-medium"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
