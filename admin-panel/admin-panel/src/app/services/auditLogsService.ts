import { authApi } from "./apiClient";

export interface AuditLogItem {
  _id: string;
  adminId?: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  module: string;
  details: string;
  severity: "info" | "warning" | "success";
  ipAddress: string;
  createdAt: string;
}

export const auditLogsService = {
  getLogs: async (module?: string, search?: string): Promise<AuditLogItem[]> => {
    try {
      const params: any = {};
      if (module && module !== "All") params.module = module;
      if (search) params.search = search;

      const res = await authApi().get("/audit-logs", { params });
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
      return [];
    } catch (err: any) {
      console.warn("Could not fetch remote audit logs:", err?.message);
      return [];
    }
  },

  logAction: async (action: string, module: string, details: string, severity = "info") => {
    try {
      await authApi().post("/audit-logs", { action, module, details, severity });
    } catch (_) {}
  },
};
