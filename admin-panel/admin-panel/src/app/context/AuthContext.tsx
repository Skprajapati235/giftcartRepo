"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as service from "../services/adminService";
import { useToast } from "../../context/ToastContext";

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string;
  authenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function safeParseJson(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isValidToken(token: string | null) {
  if (!token) return false;
  const payload = parseJwt(token);
  return Boolean(payload?.exp && payload.exp * 1000 > Date.now());
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const clearSession = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("giftcartAdminToken");
      localStorage.removeItem("giftcartAdminUser");
    }
    setToken(null);
    setUser(null);
  };

  const setSession = (tokenValue: string, userValue: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("giftcartAdminToken", tokenValue);
      localStorage.setItem("giftcartAdminUser", JSON.stringify(userValue));
    }
    setToken(tokenValue);
    setUser(userValue);
  };

  const login = async (payload: { email: string; password: string }) => {
    setLoading(true);
    setError("");

    try {
      const data = await service.loginAdmin(payload);
      const user = data.user || data.admin;
      setSession(data.token, user);
      showToast("Signed in successfully", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      setError(msg);
      showToast(msg, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    setError("");

    try {
      await service.registerAdmin(payload);
      showToast("Account created! Please sign in.", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Registration failed";
      setError(msg);
      showToast(msg, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const storedToken = localStorage.getItem("giftcartAdminToken");
    const storedUser = localStorage.getItem("giftcartAdminUser");

    const parsedUser = safeParseJson(storedUser);
    if (storedToken && parsedUser && isValidToken(storedToken)) {
      setToken(storedToken);
      setUser(parsedUser);
    } else {
      clearSession();
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;

    const payload = parseJwt(token);
    if (!payload?.exp) return;

    const expiresIn = payload.exp * 1000 - Date.now();
    if (expiresIn <= 0) {
      clearSession();
      return;
    }

    const timeout = window.setTimeout(() => {
      clearSession();
    }, expiresIn);

    return () => window.clearTimeout(timeout);
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      authenticated: Boolean(user && token),
      login,
      register,
      logout: clearSession,
    }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
