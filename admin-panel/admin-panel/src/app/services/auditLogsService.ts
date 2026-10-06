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
  format?: "csv" | "pdf" | "json" | "excel" | "none";
  severity: "info" | "warning" | "danger" | "success";
  ipAddress: string;
  userAgent?: string;
  metadata?: any;
  createdAt: string;
}

export interface GetAuditLogsParams {
  module?: string;
  format?: string;
  severity?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const auditLogsService = {
  getLogs: async (paramsOrModule?: string | GetAuditLogsParams, search?: string): Promise<AuditLogItem[]> => {
    try {
      let queryParams: any = {};
      if (typeof paramsOrModule === "string") {
        if (paramsOrModule && paramsOrModule !== "All") queryParams.module = paramsOrModule;
        if (search) queryParams.search = search;
      } else if (paramsOrModule && typeof paramsOrModule === "object") {
        queryParams = { ...paramsOrModule };
        if (queryParams.module === "All") delete queryParams.module;
        if (queryParams.format === "all") delete queryParams.format;
        if (queryParams.severity === "all") delete queryParams.severity;
      }

      const res = await authApi().get("/audit-logs", { params: queryParams });
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
      return [];
    } catch (err: any) {
      console.warn("Could not fetch remote audit logs:", err?.message);
      return [];
    }
  },

  getPaginatedLogs: async (
    params: GetAuditLogsParams = {}
  ): Promise<{
    logs: AuditLogItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    try {
      const queryParams: any = { limit: 10, page: 1, ...params };
      if (queryParams.module === "All") delete queryParams.module;
      if (queryParams.format === "all") delete queryParams.format;
      if (queryParams.severity === "all") delete queryParams.severity;

      const res = await authApi().get("/audit-logs", { params: queryParams });
      if (res.data?.success) {
        return {
          logs: res.data.data || [],
          total: res.data.total || 0,
          page: res.data.page || 1,
          limit: res.data.limit || 10,
          totalPages: res.data.totalPages || 1,
        };
      }
      return { logs: [], total: 0, page: 1, limit: 10, totalPages: 1 };
    } catch (err: any) {
      console.warn("Could not fetch paginated audit logs:", err?.message);
      return { logs: [], total: 0, page: 1, limit: 10, totalPages: 1 };
    }
  },

  deleteLog: async (id: string): Promise<boolean> => {
    try {
      const res = await authApi().delete(`/audit-logs/${id}`);
      return Boolean(res.data?.success);
    } catch (err: any) {
      console.error(`Failed to delete audit log ${id}:`, err);
      throw err;
    }
  },

  bulkDeleteLogs: async (ids: string[]): Promise<number> => {
    try {
      const res = await authApi().post("/audit-logs/bulk-delete", { ids });
      return res.data?.deletedCount || 0;
    } catch (err: any) {
      console.error("Failed to bulk delete audit logs:", err);
      throw err;
    }
  },

  clearAllLogs: async (): Promise<number> => {
    try {
      const res = await authApi().delete("/audit-logs/clear-all");
      return res.data?.deletedCount || 0;
    } catch (err: any) {
      console.error("Failed to clear all audit logs:", err);
      throw err;
    }
  },

  logAction: async (
    action: string,
    module: string,
    details: string,
    severity: "info" | "warning" | "danger" | "success" = "info",
    format: "csv" | "pdf" | "json" | "excel" | "none" = "none"
  ) => {
    try {
      await authApi().post("/audit-logs", { action, module, details, severity, format });
    } catch (err) {
      console.warn("Could not record audit log:", err);
    }
  },

  /**
   * Universal API-based file downloader.
   * Hits the backend endpoint with auth token, receives the binary blob,
   * extracts the filename, triggers the native browser save, and logs the activity.
   */
  downloadBlob: async (endpoint: string, fallbackFilename: string): Promise<boolean> => {
    try {
      const res = await authApi().get(endpoint, {
        responseType: "blob",
      });

      let filename = fallbackFilename;
      const disposition = res.headers["content-disposition"] || res.headers["Content-Disposition"];
      if (disposition && typeof disposition === "string") {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, "").trim();
        }
      }

      const blob = new Blob([res.data], {
        type: res.headers["content-type"] || "application/octet-stream",
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      return true;
    } catch (err: any) {
      console.error(`Download failed from ${endpoint}:`, err);
      throw err;
    }
  },

  // Orders Export: CSV or JSON (Hits /api/order/admin/export/:format)
  exportOrders: async (format: "csv" | "json" = "csv") => {
    const dateStr = new Date().toISOString().slice(0, 10);
    return auditLogsService.downloadBlob(
      `/order/admin/export/${format}`,
      `giftfestive-orders-${dateStr}.${format}`
    );
  },

  // Products Export: CSV or JSON (Hits /api/product/export/:format)
  exportProducts: async (format: "csv" | "json" = "csv") => {
    const dateStr = new Date().toISOString().slice(0, 10);
    return auditLogsService.downloadBlob(
      `/product/export/${format}`,
      `giftfestive-products-${dateStr}.${format}`
    );
  },

  // Inventory Export: Excel/CSV or PDF (Hits /api/inventory/export/:format)
  exportInventory: async (format: "excel" | "pdf" = "excel") => {
    const ext = format === "excel" ? "csv" : "pdf";
    const dateStr = new Date().toISOString().slice(0, 10);
    return auditLogsService.downloadBlob(
      `/inventory/export/${format}`,
      `giftfestive-inventory-${dateStr}.${ext}`
    );
  },

  // Audit Logs Export: CSV or JSON (Hits /api/audit-logs/export/:format)
  exportAuditLogs: async (format: "csv" | "json" = "csv") => {
    const dateStr = new Date().toISOString().slice(0, 10);
    return auditLogsService.downloadBlob(
      `/audit-logs/export/${format}`,
      `giftfestive-audit-logs-${dateStr}.${format}`
    );
  },

  // Download Invoice PDF for an order (Hits /api/order/admin/:id/invoice)
  downloadInvoice: async (orderId: string) => {
    return auditLogsService.downloadBlob(
      `/order/admin/${orderId}/invoice`,
      `invoice-${orderId}.pdf`
    );
  },
};

