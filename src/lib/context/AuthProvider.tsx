"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import type { User, Company } from "@/lib/types";
import { authServices } from "@/lib/services/Auth.services";
import { companyServices } from "@/lib/services/Companies.services";

type AuthContextType = {
  token: string | null;
  user: User | null;
  company: Company | null;
  loading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
  refreshUser: () => Promise<void>;
  refreshCompany: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authServices.getMe();
      setUser(response.data.user as User);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem("hr_auto_token");
    }
  }, []);

  const refreshCompany = useCallback(async () => {
    try {
      const response = await companyServices.getMy();
      setCompany(response.data.company as Company);
    } catch {
      setCompany(null);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hr_auto_token");
    setToken(null);
    setUser(null);
    setCompany(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("hr_auto_token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      Promise.all([refreshUser(), refreshCompany()]).finally(() =>
        setLoading(false),
      );
    } else if (!loading) {
      setUser(null);
      setCompany(null);
    }
  }, [token, refreshUser, refreshCompany, loading]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        company,
        loading,
        setToken,
        setUser,
        setCompany,
        refreshUser,
        refreshCompany,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
