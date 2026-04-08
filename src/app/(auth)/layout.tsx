"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthProvider";
import { Sparkles } from "lucide-react";

// Pages that authenticated users can still access (e.g. onboarding)
const ALLOW_WITH_TOKEN = ["/register", "/register/create-company"];

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && token && !ALLOW_WITH_TOKEN.includes(pathname)) {
      router.replace("/jobs");
    }
  }, [token, loading, router, pathname]);

  // Prevent rendering while redirecting (but allow whitelisted pages)
  if (loading || (token && !ALLOW_WITH_TOKEN.includes(pathname))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Branding */}
      <div className="hidden lg:flex flex-col bg-primary text-primary-foreground p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
            <span className="font-bold text-xl">H</span>
          </div>
          <span className="font-semibold text-2xl">HR Auto</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/10 text-sm font-medium mb-6 w-fit">
            <Sparkles className="h-4 w-4" />
            AI-Powered Hiring
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Hire smarter, faster, better.
          </h1>

          <p className="text-primary-foreground/80 text-lg">
            Join thousands of companies using AI to streamline hiring.
          </p>
        </div>

        <p className="text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} HR Auto
        </p>
      </div>

      {/* Right Form */}
      <div className="flex flex-col">
        <div className="p-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">H</span>
            </div>
            <span className="font-semibold text-xl">HR Auto</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
