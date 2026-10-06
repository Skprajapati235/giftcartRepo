"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  HardDriveDownload,
  RefreshCw,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  User,
  ShoppingBag,
  Package,
  Layers,
  ArrowDownToLine,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { auditLogsService, AuditLogItem } from "../../services/auditLogsService";

interface DashboardActivityTabProps {
  onRefreshParent?: () => void;
}

export default function DashboardActivityTab({ onRefreshParent }: DashboardActivityTabProps) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "admin";

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("All");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("all");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogsService.getPaginatedLogs({
        module: selectedModule,
        format: selectedFormat,
        search: searchTerm,
        page,
        limit,
      });
      setLogs(res.logs || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      console.error("Failed to load audit logs:", err);
      showToast(err?.message || "Failed to load activity logs", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedModule, selectedFormat, searchTerm, page, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Generic handler to download via backend API and immediately refresh live activity log
  const handleDownload = async (
    key: string,
    label: string,
    downloadFn: () => Promise<boolean>
  ) => {
    setDownloadingKey(key);
    try {
      await downloadFn();
      showToast(`✅ ${label} exported via API & logged to Activity!`, "success");
      await fetchLogs();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      console.error(`Download error for ${key}:`, err);
      showToast(err?.message || `Failed to download ${label}`, "error");
    } finally {
      setDownloadingKey(null);
    }
  };

  // Super Admin delete single
  const handleDelete = async (id: string, actionName: string) => {
    if (!window.confirm(`Delete activity record "${actionName}"?`)) return;
    setIsDeleting(true);
    try {
      await auditLogsService.deleteLog(id);
      showToast("Activity record deleted successfully", "success");
      await fetchLogs();
    } catch (err: any) {
      showToast(err?.message || "Failed to delete log", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Date categorization helper
  const getDateCategory = (dateStr: string): "today" | "yesterday" | "earlier" => {
    const d = new Date(dateStr);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const time = d.getTime();

    if (time >= todayStart) return "today";
    if (time >= yesterdayStart) return "yesterday";
    return "earlier";
  };

  const formatDateGroupHeader = (dateStr: string): string => {
    const cat = getDateCategory(dateStr);
    if (cat === "today") return "⚡ TODAY'S ACTIVITIES";
    if (cat === "yesterday") return "📅 YESTERDAY'S ACTIVITIES";
    return (
      "🗓️ " +
      new Date(dateStr).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).toUpperCase()
    );
  };

  const displayedLogs = logs.filter((l) => {
    if (selectedDateFilter === "all") return true;
    const cat = getDateCategory(l.createdAt);
    if (selectedDateFilter === "today") return cat === "today";
    if (selectedDateFilter === "yesterday") return cat === "yesterday";
    return true;
  });

  const getFormatBadge = (format?: string) => {
    if (!format || format === "none") return null;
    const fmt = format.toUpperCase();
    const isPdf = fmt === "PDF";
    const isCsv = fmt === "CSV" || fmt === "EXCEL";
    const isJson = fmt === "JSON";

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
          isPdf
            ? "bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30"
            : isCsv
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
            : isJson
            ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30"
            : "bg-primary/10 text-primary border border-primary/20"
        }`}
      >
        <HardDriveDownload className="h-3 w-3" />
        {fmt}
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </span>
        );
      case "danger":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-3 w-3" />
            Danger
          </span>
        );
      case "info":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
            <Info className="h-3 w-3" />
            Info
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Download Hub Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border-theme bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Activity className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Activity Hub & Central Export Center
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              100% API-driven telemetry. Strictly retains last 10 days of records (older logs auto-purged from MongoDB).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3.5 py-2 text-xs font-bold text-foreground hover:bg-hover-theme transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Central API Download / Export Hub Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HardDriveDownload className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              API Export Center (Instant CSV / PDF / JSON)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Hits real backend controllers & records activity log
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Orders */}
          <div className="flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-4 shadow-sm hover:border-emerald-500/40 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-black text-foreground">Orders Export</h4>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  /api/order
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exports all customer orders, payments, statuses, addresses & delivery slots.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 mt-2 border-t border-border-theme/40">
              <button
                type="button"
                onClick={() =>
                  handleDownload("orders-csv", "Orders (CSV)", () =>
                    auditLogsService.exportOrders("csv")
                  )
                }
                disabled={Boolean(downloadingKey)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>{downloadingKey === "orders-csv" ? "Exporting..." : "CSV"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownload("orders-json", "Orders (JSON)", () =>
                    auditLogsService.exportOrders("json")
                  )
                }
                disabled={Boolean(downloadingKey)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-theme bg-background hover:bg-hover-theme active:scale-95 text-foreground text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>{downloadingKey === "orders-json" ? "Exporting..." : "JSON"}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Catalog Products */}
          <div className="flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-4 shadow-sm hover:border-blue-500/40 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Package className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-black text-foreground">Catalog Export</h4>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  /api/product
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exports all product items, categories, MRP, sale prices, stock & eggless tags.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 mt-2 border-t border-border-theme/40">
              <button
                type="button"
                onClick={() =>
                  handleDownload("products-csv", "Catalog (CSV)", () =>
                    auditLogsService.exportProducts("csv")
                  )
                }
                disabled={Boolean(downloadingKey)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>{downloadingKey === "products-csv" ? "Exporting..." : "CSV"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownload("products-json", "Catalog (JSON)", () =>
                    auditLogsService.exportProducts("json")
                  )
                }
                disabled={Boolean(downloadingKey)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-theme bg-background hover:bg-hover-theme active:scale-95 text-foreground text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>{downloadingKey === "products-json" ? "Exporting..." : "JSON"}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Inventory Warehouse */}
          <div className="flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-4 shadow-sm hover:border-amber-500/40 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Layers className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-black text-foreground">Stock & Warehouse</h4>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  /api/inventory
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exports warehouse stock sheets, low stock alerts, and inventory ledger.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 mt-2 border-t border-border-theme/40">
              <button
                type="button"
                onClick={() =>
                  handleDownload("inventory-excel", "Inventory (Excel)", () =>
                    auditLogsService.exportInventory("excel")
                  )
                }
                disabled={Boolean(downloadingKey)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>{downloadingKey === "inventory-excel" ? "Exporting..." : "Excel"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownload("inventory-pdf", "Inventory (PDF)", () =>
                    auditLogsService.exportInventory("pdf")
                  )
                }
                disabled={Boolean(downloadingKey)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{downloadingKey === "inventory-pdf" ? "Exporting..." : "PDF"}</span>
              </button>
            </div>
          </div>

          {/* Card 4: Audit & Activity Logs */}
          <div className="flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-4 shadow-sm hover:border-purple-500/40 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-black text-foreground">Audit Log Trail</h4>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  /api/audit-logs
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exports compliance audit trail with admin roles, IP verification & timestamps.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 mt-2 border-t border-border-theme/40">
              <button
                type="button"
                onClick={() =>
                  handleDownload("audit-csv", "Audit Logs (CSV)", () =>
                    auditLogsService.exportAuditLogs("csv")
                  )
                }
                disabled={Boolean(downloadingKey)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>{downloadingKey === "audit-csv" ? "Exporting..." : "CSV"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownload("audit-json", "Audit Logs (JSON)", () =>
                    auditLogsService.exportAuditLogs("json")
                  )
                }
                disabled={Boolean(downloadingKey)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-theme bg-background hover:bg-hover-theme active:scale-95 text-foreground text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>{downloadingKey === "audit-json" ? "Exporting..." : "JSON"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border-theme bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search activities by admin name, action, or details..."
            className="w-full rounded-xl border border-border-theme bg-background pl-10 pr-4 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Date, Format & Module Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="rounded-xl border border-border-theme bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">📅 All 10 Days</option>
            <option value="today">⚡ Today Only</option>
            <option value="yesterday">🗓️ Yesterday Only</option>
          </select>

          <select
            value={selectedFormat}
            onChange={(e) => {
              setSelectedFormat(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-border-theme bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">All Formats</option>
            <option value="csv">CSV Exports</option>
            <option value="pdf">PDF Exports</option>
            <option value="json">JSON Exports</option>
            <option value="excel">Excel Exports</option>
            <option value="none">Standard Actions</option>
          </select>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {["All", "Orders", "Catalog", "Inventory", "Admin Management", "Authentication"].map(
              (mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => {
                    setSelectedModule(mod);
                    setPage(1);
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedModule === mod
                      ? "bg-primary text-white shadow-2xs"
                      : "border border-border-theme bg-background text-slate-600 dark:text-slate-400 hover:bg-hover-theme"
                  }`}
                >
                  {mod}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* 4. Live Activity Table */}
      <div className="rounded-3xl border border-border-theme bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border-theme/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-black text-foreground">
              Live Activity Stream (Page {page} of {totalPages} • Total {total} events)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">
            Strict 10-Day Retention Active • Zero Dummy Data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border-theme bg-background/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Admin Member</th>
                <th className="py-3.5 px-4">Action & Format</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Event Details</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp & IP</th>
                {isSuperAdmin && <th className="py-3.5 px-4 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme/60">
              {loading ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Fetching real-time activity log from MongoDB...
                  </td>
                </tr>
              ) : displayedLogs.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 6} className="py-12 text-center text-slate-400">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-bold text-foreground">No activity records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Records older than 10 days are automatically deleted.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedLogs.map((entry, index) => {
                  const currentHeader = formatDateGroupHeader(entry.createdAt);
                  const prevHeader =
                    index > 0 ? formatDateGroupHeader(displayedLogs[index - 1].createdAt) : null;
                  const isNewDateGroup = currentHeader !== prevHeader;

                  return (
                    <React.Fragment key={entry._id}>
                      {isNewDateGroup && (
                        <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-y border-border-theme font-black text-slate-600 dark:text-slate-300">
                          <td colSpan={isSuperAdmin ? 7 : 6} className="py-2 px-4 text-[11px]">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              <span className="font-extrabold tracking-wide">{currentHeader}</span>
                            </div>
                          </td>
                        </tr>
                      )}

                      <tr className="hover:bg-hover-theme/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-xs uppercase">
                              {entry.adminName ? entry.adminName[0] : "A"}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{entry.adminName || "Admin"}</p>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {entry.adminRole ? entry.adminRole.replace(/_/g, " ").toUpperCase() : "STAFF"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground">{entry.action}</span>
                            {getFormatBadge(entry.format)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="rounded-lg bg-background border border-border-theme px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {entry.module}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-sm text-slate-600 dark:text-slate-300 font-medium">
                          <p className="line-clamp-2" title={entry.details}>
                            {entry.details}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          {getSeverityBadge(entry.severity)}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-700 dark:text-slate-300">
                            {entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Just now"}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">
                            IP: {entry.ipAddress || "127.0.0.1"}
                          </span>
                        </td>

                        {isSuperAdmin && (
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleDelete(entry._id, entry.action)}
                              disabled={isDeleting}
                              className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition disabled:opacity-50 cursor-pointer"
                              title="Delete record (Super Admin Only)"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-border-theme/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-background/40">
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-foreground">{(page - 1) * limit + 1}</span> to{" "}
            <span className="font-bold text-foreground">{Math.min(page * limit, total)}</span> of{" "}
            <span className="font-bold text-foreground">{total}</span> records (10 per page)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-background hover:bg-hover-theme text-foreground text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pageNum = page - 3 + i;
                  if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                      page === pageNum
                        ? "bg-primary text-white shadow-2xs"
                        : "border border-border-theme bg-background text-foreground hover:bg-hover-theme"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-background hover:bg-hover-theme text-foreground text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
