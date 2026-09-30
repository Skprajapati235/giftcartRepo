import axios, { AxiosInstance } from "axios";

export const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const getAuthToken = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("giftcartAdminToken") || "";
};

const setupInterceptors = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
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
      ...(effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {}),
    },
  });
  return setupInterceptors(instance);
};
