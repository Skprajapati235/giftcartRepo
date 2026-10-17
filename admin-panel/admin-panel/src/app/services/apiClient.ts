import axios, { AxiosInstance } from "axios";

// Cookie sessions (ON by default; set NEXT_PUBLIC_COOKIE_AUTH=false to go back to the old
// localStorage token). The admin session is two httpOnly cookies JavaScript can't read:
//   • access token  — 15 minutes
//   • refresh token — rotates on every use, 7 days idle, 30 days maximum
// The browser calls the API through the same-origin proxy /backend/* (see next.config.ts).
// The value below is only a NON-secret marker that means "there is a cookie session";
// it is never sent to the server.
export const COOKIE_AUTH = process.env.NEXT_PUBLIC_COOKIE_AUTH !== "false";
export const COOKIE_SESSION_MARKER = "cookie-session";

const absoluteBaseURL =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  (process.env.NODE_ENV === "production"
    ? "https://giftcartrepo.onrender.com/api"
    : "http://localhost:5000/api");

export const baseURL = COOKIE_AUTH && typeof window !== "undefined" ? "/backend" : absoluteBaseURL;

export const getAuthToken = (): string => {
  if (typeof window === "undefined") return "";
  if (COOKIE_AUTH) {
    // a saved admin profile means a cookie session exists; a leftover legacy token is
    // only returned until AuthContext has exchanged it for the cookie
    if (localStorage.getItem("giftcartAdminUser")) return COOKIE_SESSION_MARKER;
    return localStorage.getItem("giftcartAdminToken") || "";
  }
  return localStorage.getItem("giftcartAdminToken") || "";
};

/** Headers for raw fetch() calls (axios instances add these automatically). */
export const authHeaders = (token: string = getAuthToken()): Record<string, string> => ({
  ...(COOKIE_AUTH ? { "X-Auth-Mode": "cookie" } : {}),
  ...(token && token !== COOKIE_SESSION_MARKER ? { Authorization: `Bearer ${token}` } : {}),
});

// One refresh at a time per tab, no matter how many requests got a 401 together.
let refreshInFlight: Promise<boolean> | null = null;
const refreshAdminSession = (): Promise<boolean> => {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .create() // a clean instance: no interceptors, so a failed refresh can't loop
      .post(`${baseURL}/admin/auth/refresh`, {}, { headers: { "X-Auth-Mode": "cookie" }, timeout: 45000 })
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

const setupInterceptors = (instance: AxiosInstance): AxiosInstance => {
  // Normalize request URLs so leading "/api" doesn't collide with baseURL ending in "/api"
  instance.interceptors.request.use((config) => {
    const rawBase = (config.baseURL || baseURL || "").replace(/\/+$/, "");
    if (rawBase.endsWith("/api") && config.url && config.url.startsWith("/api/")) {
      config.url = config.url.replace(/^\/api/, "");
    }
    // Only our own proxy gets the cookie-mode header (other hosts, e.g. Cloudinary, must not).
    if (COOKIE_AUTH && (rawBase.startsWith("/backend") || String(config.url || "").startsWith("/backend"))) {
      config.headers["X-Auth-Mode"] = "cookie";
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;

      // Access token (15 min) ran out → silently get a new pair with the refresh cookie, then
      // repeat the request. Only when this really is a cookie session; never for login/refresh calls.
      const reqConfig = error?.config;
      const reqUrl = String(reqConfig?.url || "");
      const isAuthRoute = /\/admin\/auth\/(login|google-login|register|refresh|logout|session|forgot-password|reset-password)/.test(reqUrl);
      if (
        COOKIE_AUTH &&
        status === 401 &&
        reqConfig &&
        !reqConfig._retriedAfterRefresh &&
        !isAuthRoute &&
        typeof window !== "undefined" &&
        localStorage.getItem("giftcartAdminUser")
      ) {
        reqConfig._retriedAfterRefresh = true;
        if (await refreshAdminSession()) {
          return instance.request(reqConfig);
        }
      }

      const isVerifyRoute = Boolean(error?.config?.url?.includes("/admin/auth/verify-session"));
      // If 401 Unauthorized on normal API calls, dispatch global session-expired event
      if (status === 401 && !isVerifyRoute && typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const isPublicPath = ["/", "/register", "/forgot-password"].includes(currentPath);
        if (!isPublicPath) {
          window.dispatchEvent(
            new CustomEvent("giftcart:session-expired", {
              detail: {
                status: 401,
                reason: "unauthorized",
                message: error.response?.data?.message || "Session expired or unauthorized. Please sign in again.",
              },
            })
          );
        }
      }
      return Promise.reject(error);
    }
  );
  return instance;
};

// Global interceptor for default axios
if (typeof window !== "undefined") {
  setupInterceptors(axios);
}

export const api = setupInterceptors(
  axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  })
);

export const authApi = (token?: string): AxiosInstance => {
  const effectiveToken = token !== undefined ? token : getAuthToken();
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      // the cookie-session marker is not a real token → no Authorization header, the cookie is used
      ...(effectiveToken && effectiveToken !== COOKIE_SESSION_MARKER
        ? { Authorization: `Bearer ${effectiveToken}` }
        : {}),
    },
  });
  return setupInterceptors(instance);
};
