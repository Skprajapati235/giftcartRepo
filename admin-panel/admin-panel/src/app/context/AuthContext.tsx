"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as service from "../services/adminService";
import { useToast } from "../../context/ToastContext";
import {
  INACTIVITY_TIMEOUT_MS,
  WARNING_THRESHOLD_MS,
  WARNING_WINDOW_SECONDS,
  HEARTBEAT_INTERVAL_MS,
  INACTIVITY_EXPIRED_MESSAGE,
} from "../utils/sessionConfig";

export interface AuthState {
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
  logout: (reason?: any) => void;
  setSession: (tokenValue: string, userValue: any) => void;
  sessionWarning: boolean;
  remainingSeconds: number;
  stayLoggedIn: () => void;
  sessionExpiredNotice: string | null;
  clearExpiredNotice: () => void;
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

  // Inactivity countdown states
  const [sessionWarning, setSessionWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(WARNING_WINDOW_SECONDS);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(null);

  const lastActiveRef = useRef<number>(Date.now());
  const lastThrottleRef = useRef<number>(0);

  const clearExpiredNotice = useCallback(() => {
    setSessionExpiredNotice(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("giftcartSessionExpiredNotice");
    }
  }, []);

  const clearSession = useCallback(
    (options?: { reason?: string; message?: string }) => {
      const msg =
        options?.message ||
        (options?.reason === "inactivity"
          ? INACTIVITY_EXPIRED_MESSAGE
          : "Session expired. Please sign in again.");

      if (typeof window !== "undefined") {
        localStorage.removeItem("giftcartAdminToken");
        localStorage.removeItem("giftcartAdminUser");
        localStorage.removeItem("giftcartAdminLastActive");
        sessionStorage.setItem("giftcartSessionExpiredNotice", msg);
      }

      setToken(null);
      setUser(null);
      setSessionWarning(false);
      setSessionExpiredNotice(msg);

      if (typeof window !== "undefined") {
        const isPublicPath = ["/", "/register", "/forgot-password"].includes(
          window.location.pathname
        );
        if (!isPublicPath) {
          window.location.replace("/?expired=true");
        }
      }
    },
    []
  );

  const setSession = useCallback((tokenValue: string, userValue: any) => {
    const now = Date.now();
    lastActiveRef.current = now;
    const cleanUser = userValue
      ? {
          _id: userValue._id || userValue.id,
          name: userValue.name,
          email: userValue.email,
          role: userValue.role,
          department: userValue.department || "Executive Management",
          permissions: userValue.permissions || (userValue.role === "super_admin" || userValue.role === "admin" ? ["*"] : []),
          profilePic: userValue.profilePic,
          city: userValue.city,
          state: userValue.state,
        }
      : null;

    if (typeof window !== "undefined") {
      localStorage.setItem("giftcartAdminToken", tokenValue);
      localStorage.setItem("giftcartAdminUser", JSON.stringify(cleanUser));
      localStorage.setItem("giftcartAdminLastActive", String(now));
      sessionStorage.removeItem("giftcartSessionExpiredNotice");
    }
    setToken(tokenValue);
    setUser(cleanUser);
    setSessionWarning(false);
    setSessionExpiredNotice(null);
  }, []);

  const stayLoggedIn = useCallback(() => {
    const now = Date.now();
    lastActiveRef.current = now;
    if (typeof window !== "undefined") {
      localStorage.setItem("giftcartAdminLastActive", String(now));
    }
    setSessionWarning(false);
    setRemainingSeconds(WARNING_WINDOW_SECONDS);

    // Verify session with backend to sync authentic database role & permissions
    service
      .verifyAdminSession()
      .then((res) => {
        if (res?.valid && res?.admin) {
          const verifiedUser = {
            _id: res.admin._id || res.admin.id,
            name: res.admin.name,
            email: res.admin.email,
            role: res.admin.role,
            department: res.admin.department || "Executive Management",
            permissions: res.admin.permissions || (res.admin.role === "super_admin" || res.admin.role === "admin" ? ["*"] : []),
            profilePic: res.admin.profilePic,
            city: res.admin.city,
            state: res.admin.state,
          };
          setUser(verifiedUser);
          if (typeof window !== "undefined") {
            localStorage.setItem("giftcartAdminUser", JSON.stringify(verifiedUser));
          }
        }
      })
      .catch(() => {});
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    setLoading(true);
    setError("");

    try {
      const data = await service.loginAdmin(payload);
      const userObj = data.user || data.admin;
      setSession(data.token, userObj);
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
      const msg =
        err.response?.data?.message || err.message || "Registration failed";
      setError(msg);
      showToast(msg, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 1. Initial hydration from storage & check if already expired
  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const notice = sessionStorage.getItem("giftcartSessionExpiredNotice");
    if (notice) {
      setSessionExpiredNotice(notice);
    }

    const storedToken = localStorage.getItem("giftcartAdminToken");
    const storedUser = localStorage.getItem("giftcartAdminUser");
    const storedLastActive = localStorage.getItem("giftcartAdminLastActive");

    const parsedUser = safeParseJson(storedUser);
    const lastActiveTime = storedLastActive ? parseInt(storedLastActive, 10) : 0;
    const now = Date.now();

    // Check if token exists, is valid JWT, and has not exceeded inactivity timeout
    if (storedToken && parsedUser && isValidToken(storedToken)) {
      if (lastActiveTime && now - lastActiveTime > INACTIVITY_TIMEOUT_MS) {
        // Was inactive while browser was closed or page refreshed
        clearSession({
          reason: "inactivity",
          message: INACTIVITY_EXPIRED_MESSAGE,
        });
      } else {
        lastActiveRef.current = lastActiveTime || now;
        setToken(storedToken);
        setUser(parsedUser);
        localStorage.setItem("giftcartAdminLastActive", String(lastActiveRef.current));

        // Sync authentic database role & permissions to prevent local role spoofing
        service
          .verifyAdminSession()
          .then((res) => {
            if (res?.valid && res?.admin) {
              const verified = {
                _id: res.admin._id || res.admin.id,
                name: res.admin.name,
                email: res.admin.email,
                role: res.admin.role,
                department: res.admin.department || "Executive Management",
                permissions: res.admin.permissions || (res.admin.role === "super_admin" || res.admin.role === "admin" ? ["*"] : []),
                profilePic: res.admin.profilePic,
                city: res.admin.city,
                state: res.admin.state,
              };
              setUser(verified);
              localStorage.setItem("giftcartAdminUser", JSON.stringify(verified));
            }
          })
          .catch(() => {});
      }
    } else {
      if (storedToken || storedUser) {
        clearSession({ reason: "invalid_token" });
      } else {
        setToken(null);
        setUser(null);
      }
    }

    setLoading(false);
  }, [clearSession]);

  // 2. Activity listeners (resets the 30s inactivity timer on user interactions)
  useEffect(() => {
    if (!token) return;

    const handleUserActivity = () => {
      const now = Date.now();
      lastActiveRef.current = now;

      // Throttle localStorage updates to once per 1000ms for high performance
      if (now - lastThrottleRef.current > 1000) {
        lastThrottleRef.current = now;
        localStorage.setItem("giftcartAdminLastActive", String(now));
      }

      // If warning modal was displayed, automatically dismiss it upon activity
      setSessionWarning((prev) => {
        if (prev) {
          setRemainingSeconds(WARNING_WINDOW_SECONDS);
          return false;
        }
        return false;
      });
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
      "click",
      "pointerdown",
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [token]);

  // 3. Second-by-second Inactivity & Warning Check
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const storedLastStr = localStorage.getItem("giftcartAdminLastActive");
      const storedLast = storedLastStr ? parseInt(storedLastStr, 10) : lastActiveRef.current;
      const effectiveLast = Math.max(lastActiveRef.current, storedLast);
      lastActiveRef.current = effectiveLast;

      const idleMs = now - effectiveLast;

      if (idleMs >= INACTIVITY_TIMEOUT_MS) {
        clearSession({
          reason: "inactivity",
          message: INACTIVITY_EXPIRED_MESSAGE,
        });
      } else if (idleMs >= WARNING_THRESHOLD_MS) {
        setSessionWarning(true);
        const rem = Math.max(1, Math.ceil((INACTIVITY_TIMEOUT_MS - idleMs) / 1000));
        setRemainingSeconds(rem);
      } else {
        setSessionWarning(false);
        setRemainingSeconds(WARNING_WINDOW_SECONDS);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token, clearSession]);

  // 4. Periodic Session Check API (Backend Heartbeat every 15s)
  useEffect(() => {
    if (!token) return;

    const checkServerSession = async () => {
      try {
        const res = await service.verifyAdminSession();
        if (res && res.valid && res.admin) {
          setUser((prev: any) => ({ ...prev, ...res.admin }));
        }
      } catch (err: any) {
        const status = err?.response?.status;
        // 401 or 403 means session is definitively invalid or revoked on server
        if (status === 401 || status === 403) {
          clearSession({
            reason: "server",
            message: "Session expired or revoked by server. Please sign in again.",
          });
        }
      }
    };

    // Heartbeat runs every 15 seconds
    const interval = setInterval(checkServerSession, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [token, clearSession]);

  // 5. Visibility and Focus Change Listener
  useEffect(() => {
    if (!token) return;

    const handleVisibilityOrFocus = () => {
      const now = Date.now();
      const storedLastStr = localStorage.getItem("giftcartAdminLastActive");
      const storedLast = storedLastStr ? parseInt(storedLastStr, 10) : lastActiveRef.current;

      // If user was away longer than inactivity timeout, expire session immediately
      if (now - storedLast >= INACTIVITY_TIMEOUT_MS) {
        clearSession({
          reason: "inactivity",
          message: INACTIVITY_EXPIRED_MESSAGE,
        });
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, [token, clearSession]);

  // 6. Multi-tab Sync & Global 401 Event Handling
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "giftcartAdminToken" && !e.newValue) {
        clearSession({
          reason: "cross-tab",
          message: "Logged out from another tab.",
        });
      } else if (e.key === "giftcartAdminLastActive" && e.newValue) {
        const otherTabActive = parseInt(e.newValue, 10);
        lastActiveRef.current = Math.max(lastActiveRef.current, otherTabActive);
        setSessionWarning(false);
      }
    };

    const handleSessionExpiredEvent = (e: any) => {
      clearSession({
        reason: "unauthorized",
        message: e.detail?.message || "Session expired or unauthorized. Please sign in again.",
      });
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("giftcart:session-expired", handleSessionExpiredEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("giftcart:session-expired", handleSessionExpiredEvent);
    };
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      authenticated: Boolean(user && token),
      login,
      register,
      logout: (reason?: any) =>
        clearSession({
          reason: typeof reason === "string" ? reason : "manual",
          message: "Signed out successfully.",
        }),
      setSession,
      sessionWarning,
      remainingSeconds,
      stayLoggedIn,
      sessionExpiredNotice,
      clearExpiredNotice,
    }),
    [
      user,
      token,
      loading,
      error,
      sessionWarning,
      remainingSeconds,
      stayLoggedIn,
      sessionExpiredNotice,
      clearExpiredNotice,
      setSession,
      clearSession,
    ]
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
