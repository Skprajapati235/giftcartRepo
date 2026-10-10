import { authApi, getAuthToken } from "../apiClient";

export const getDecorationAnalytics = async () => {
  const response = await authApi(getAuthToken()).get("/decoration/analytics");
  return response.data;
};
