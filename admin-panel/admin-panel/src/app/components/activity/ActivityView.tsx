"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  HardDriveDownload,
  FileSpreadsheet,
  FileText,
  FileCode,
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
  Filter,
  Eye,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertOctagon,
  CheckSquare,
  Square,
  Sparkles,
  History,
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { auditLogsService, AuditLogItem } from "../../services/auditLogsService";

export default function ActivityView() {
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
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("all"); // "all" | "today" | "yesterday"
  const [inspectLog, setInspectLog] = useState<AuditLogItem | null>(null);

  // Super Admin delete selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogsService.getPaginatedLogs({
        module: selectedModule,
        format: selectedFormat,
        severity: selectedSeverity,
        search: searchTerm,
        page,
        limit,
      });

      setLogs(res.logs || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      // Reset selected checkboxes if page changes
      setSelectedIds([]);
    } catch (err: any) {
      console.error("Failed to fetch activity logs:", err);
      showToast(err?.message || "Failed to load live activity logs", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedModule, selectedFormat, selectedSeverity, searchTerm, page, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to page 1 whenever filters or search change
  const handleFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setPage(1);
  };

  // API download executor
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
    } catch (err: any) {
      console.error(`Download error for ${key}:`, err);
      showToast(err?.message || `Failed to download ${label}`, "error");
    } finally {
      setDownloadingKey(null);
    }
  };

  // Super Admin single delete
  const handleDeleteSingle = async (id: string, actionTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete activity log "${actionTitle}"?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await auditLogsService.deleteLog(id);
      showToast("Activity record deleted successfully", "success");
      await fetchLogs();
    } catch (err: any) {
      showToast(err?.message || "Failed to delete activity log", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Super Admin bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected activity records?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const deletedCount = await auditLogsService.bulkDeleteLogs(selectedIds);
      showToast(`${deletedCount} activity records deleted successfully`, "success");
      setSelectedIds([]);
      await fetchLogs();
    } catch (err: any) {
      showToast(err?.message || "Failed to delete selected activity records", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Super Admin clear all 10-day logs
  const handleClearAll = async () => {
    if (!window.confirm("⚠️ CAUTION: Are you sure you want to delete ALL activity logs within the 10-day window? This cannot be undone.")) {
      return;
    }
    setIsDeleting(true);
    try {
      const cleared = await auditLogsService.clearAllLogs();
      showToast(`${cleared} activity logs cleared successfully`, "success");
      setSelectedIds([]);
      setPage(1);
      await fetchLogs();
    } catch (err: any) {
      showToast(err?.message || "Failed to clear activity logs", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Checkbox toggle helpers
  const toggleSelectAll = () => {
    if (selectedIds.length === logs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(logs.map((l) => l._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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

  // Filter logs by selected date filter on current page
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
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider ${
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
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </span>
        );
      case "danger":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-3 w-3" />
            Critical
          </span>
        );
      case "info":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
            <Info className="h-3 w-3" />
            Info
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner & Status Bar */}
      <div className="relative overflow-hidden rounded-3xl border border-border-theme bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                  Security & Activity Audit Logs
                </h1>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Telemetry Engine: Active (MongoDB Real-Time Stream)
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    ⏳ 10-Day Retention Policy (Older Records Auto-Purged)
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl pt-1">
              Centralized administrative telemetry, system audit trail, and backend file exports. Every team action, export (CSV, PDF, JSON), and operation is tracked in real-time with automated 10-day MongoDB retention.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-4 py-2.5 text-xs font-bold text-foreground hover:bg-hover-theme transition shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
              <span>Refresh Stream</span>
            </button>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isDeleting || total === 0}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                title="Super Admin Only: Clear all 10-day activity logs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All Logs</span>
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                handleDownload("audit-top-csv", "Audit Logs (CSV)", () =>
                  auditLogsService.exportAuditLogs("csv")
                )
              }
              disabled={Boolean(downloadingKey)}
              className="flex items-center gap-1.5 rounded-xl bg-pink-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 active:scale-95 transition disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>{downloadingKey === "audit-top-csv" ? "Exporting..." : "Export Audit CSV"}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleDownload("audit-top-json", "Audit Logs (JSON)", () =>
                  auditLogsService.exportAuditLogs("json")
                )
              }
              disabled={Boolean(downloadingKey)}
              className="flex items-center gap-1.5 rounded-xl border border-pink-500/30 bg-pink-500/10 px-4 py-2.5 text-xs font-bold text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 active:scale-95 transition disabled:opacity-50 cursor-pointer"
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>{downloadingKey === "audit-top-json" ? "Exporting..." : "Export Audit JSON"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. API Export Center Hub */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <HardDriveDownload className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
              API Export Center (Direct Backend Stream)
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Hits real backend APIs • Automatically logs activity in MongoDB
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Orders */}
          <div className="flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-5 shadow-sm hover:border-emerald-500/40 transition">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">Orders Export</h3>
                    <p className="text-[10px] text-slate-400">Sales & Fulfillment</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  /api/order
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Live database stream of customer orders, amounts, statuses, delivery slots, and shipping addresses.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 mt-3 border-t border-border-theme/40">
              <button
                type="button"
                onClick={() =>
                  handleDownload("orders-csv", "Orders (CSV)", () =>
                    auditLogsService.exportOrders("csv")
                  )
                }
                disabled={Boolean(downloadingKey)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
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
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-theme bg-background hover:bg-hover-theme active:scale-95 text-foreground text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>{downloadingKey === "orders-json" ? "Exporting..." : "JSON"}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Catalog */}
          <div className="flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-5 shadow-sm hover:border-blue-500/40 transition">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">Catalog Export</h3>
                    <p className="text-[10px] text-slate-400">Products & Categories</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  /api/product
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Full catalog inventory with SKU, titles, prices, stock levels, eggless flag, and taxonomy relations.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 mt-3 border-t border-border-theme/40">
              <button
                type="button"
                onClick={() =>
                  handleDownload("catalog-csv", "Catalog (CSV)", () =>
                    auditLogsService.exportProducts("csv")
                  )
                }
                disabled={Boolean(downloadingKey)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>{downloadingKey === "catalog-csv" ? "Exporting..." : "CSV"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownload("catalog-json", "Catalog (JSON)", () =>
                    auditLogsService.exportProducts("json")
                  )
                }
                disabled={Boolean(downloadingKey)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-theme bg-background hover:bg-hover-theme active:scale-95 text-foreground text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>{downloadingKey === "catalog-json" ? "Exporting..." : "JSON"}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Inventory */}
          <div className="flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-5 shadow-sm hover:border-amber-500/40 transition">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">Stock & Warehouse</h3>
                    <p className="text-[10px] text-slate-400">Inventory Ledger</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  /api/inventory
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Warehouse balance sheets, low-stock alerts, category units, and formatted inventory PDF reports.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 mt-3 border-t border-border-theme/40">
              <button
                type="button"
                onClick={() =>
                  handleDownload("inventory-excel", "Inventory (Excel)", () =>
                    auditLogsService.exportInventory("excel")
                  )
                }
                disabled={Boolean(downloadingKey)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
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
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{downloadingKey === "inventory-pdf" ? "Exporting..." : "PDF"}</span>
              </button>
            </div>
          </div>

          {/* Card 4: Audit Logs */}
          <div className="flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-5 shadow-sm hover:border-purple-500/40 transition">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">Audit Log Trail</h3>
                    <p className="text-[10px] text-slate-400">Compliance & Security</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  /api/audit-logs
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Immutable activity logs with admin author IDs, action descriptions, IP addresses, and timestamps.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 mt-3 border-t border-border-theme/40">
              <button
                type="button"
                onClick={() =>
                  handleDownload("audit-csv", "Audit Logs (CSV)", () =>
                    auditLogsService.exportAuditLogs("csv")
                  )
                }
                disabled={Boolean(downloadingKey)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
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
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-theme bg-background hover:bg-hover-theme active:scale-95 text-foreground text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>{downloadingKey === "audit-json" ? "Exporting..." : "JSON"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter, Search & Date Group Controls */}
      <div className="flex flex-col gap-3.5 rounded-2xl border border-border-theme bg-card p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search activity by admin name, action, details, or IP address..."
              className="w-full rounded-xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Group Filter */}
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="rounded-xl border border-border-theme bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">📅 All 10 Days</option>
              <option value="today">⚡ Today Only</option>
              <option value="yesterday">🗓️ Yesterday Only</option>
            </select>

            {/* Format selector */}
            <select
              value={selectedFormat}
              onChange={(e) => handleFilterChange(setSelectedFormat, e.target.value)}
              className="rounded-xl border border-border-theme bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Formats</option>
              <option value="csv">CSV Exports</option>
              <option value="pdf">PDF Exports</option>
              <option value="json">JSON Exports</option>
              <option value="excel">Excel Exports</option>
              <option value="none">Standard Actions</option>
            </select>

            {/* Severity selector */}
            <select
              value={selectedSeverity}
              onChange={(e) => handleFilterChange(setSelectedSeverity, e.target.value)}
              className="rounded-xl border border-border-theme bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Critical</option>
            </select>
          </div>
        </div>

        {/* Module Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-border-theme/40">
          <span className="text-[11px] font-bold text-slate-400 pr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Module:
          </span>
          {["All", "Orders", "Catalog", "Inventory", "Admin Management", "Authentication", "Delivery Fleet", "System"].map(
            (mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => handleFilterChange(setSelectedModule, mod)}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
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

      {/* 4. Super Admin Bulk Action Bar */}
      {isSuperAdmin && selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-rose-500" />
            <span className="text-xs font-black">
              {selectedIds.length} activity records selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected (Super Admin)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 rounded-xl border border-border-theme bg-background text-foreground text-xs font-bold hover:bg-hover-theme transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 5. Live Activity Table with Date Grouping */}
      <div className="rounded-3xl border border-border-theme bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border-theme/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-black text-foreground">
              Live Activity Stream (Page {page} of {totalPages} • Total {total} Records)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Showing 10 records per page</span>
            <span>•</span>
            <span className="text-emerald-500 font-bold">10-Day Retention Active</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border-theme bg-background/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                {isSuperAdmin && (
                  <th className="py-3.5 px-3 text-center w-10">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-foreground transition cursor-pointer"
                      title="Select / Deselect all on this page"
                    >
                      {selectedIds.length > 0 && selectedIds.length === logs.length ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                )}
                <th className="py-3.5 px-4">Admin Member</th>
                <th className="py-3.5 px-4">Action & Format</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Event Details</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp & IP</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme/60">
              {loading ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 8 : 7} className="py-16 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Connecting to telemetry microservice & streaming 10-day activity records...
                  </td>
                </tr>
              ) : displayedLogs.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 8 : 7} className="py-16 text-center text-slate-400">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-bold text-foreground">No matching activity records found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Records older than 10 days are automatically pruned. Trigger an export or action above to see new logs appear.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedLogs.map((entry, index) => {
                  const currentHeader = formatDateGroupHeader(entry.createdAt);
                  const prevHeader =
                    index > 0 ? formatDateGroupHeader(displayedLogs[index - 1].createdAt) : null;
                  const isNewDateGroup = currentHeader !== prevHeader;
                  const isSelected = selectedIds.includes(entry._id);

                  return (
                    <React.Fragment key={entry._id}>
                      {/* Date Group Header Divider */}
                      {isNewDateGroup && (
                        <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-y border-border-theme font-black text-slate-600 dark:text-slate-300">
                          <td colSpan={isSuperAdmin ? 8 : 7} className="py-2 px-4 text-[11px]">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              <span className="font-extrabold tracking-wide">{currentHeader}</span>
                              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-primary/10 text-primary">
                                Day Verified
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}

                      <tr
                        className={`hover:bg-hover-theme/60 transition group cursor-pointer ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                        onClick={() => setInspectLog(entry)}
                      >
                        {isSuperAdmin && (
                          <td
                            className="py-3.5 px-3 text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectOne(entry._id);
                            }}
                          >
                            <button
                              type="button"
                              className="text-slate-400 hover:text-foreground transition cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        )}

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

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setInspectLog(entry)}
                              className="p-1.5 rounded-lg border border-border-theme/60 bg-background text-slate-400 hover:text-foreground hover:bg-hover-theme transition"
                              title="Inspect full event telemetry"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSingle(entry._id, entry.action)}
                                disabled={isDeleting}
                                className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition disabled:opacity-50"
                                title="Delete record (Super Admin Only)"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 6. Pagination Bar (10 Records per page) */}
        <div className="p-4 border-t border-border-theme/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-background/40">
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-foreground">{(page - 1) * limit + 1}</span> to{" "}
            <span className="font-bold text-foreground">{Math.min(page * limit, total)}</span> of{" "}
            <span className="font-bold text-foreground">{total}</span> activity records (10 per page)
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

            {/* Page number indicators */}
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

      {/* 7. Event Inspector Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-3xl border border-border-theme bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-theme pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Activity className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-foreground">
                    Telemetry Event Details
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {inspectLog._id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectLog(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-foreground hover:bg-hover-theme"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-background border border-border-theme">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Admin Author</span>
                  <p className="font-bold text-foreground mt-0.5">{inspectLog.adminName}</p>
                  <span className="text-[11px] text-slate-400">{inspectLog.adminEmail}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Role & Access</span>
                  <p className="font-bold text-foreground mt-0.5">{inspectLog.adminRole}</p>
                  <span className="text-[11px] font-mono text-slate-400">IP: {inspectLog.ipAddress}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Action Title</span>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-black text-foreground">{inspectLog.action}</p>
                  {getFormatBadge(inspectLog.format)}
                  {getSeverityBadge(inspectLog.severity)}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Full Event Log</span>
                <p className="p-3 mt-1 rounded-xl bg-background border border-border-theme text-foreground leading-relaxed">
                  {inspectLog.details}
                </p>
              </div>

              {inspectLog.metadata && Object.keys(inspectLog.metadata).length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Metadata Payload</span>
                  <pre className="p-3 mt-1 rounded-xl bg-background border border-border-theme font-mono text-[11px] text-slate-600 dark:text-slate-300 overflow-x-auto">
                    {JSON.stringify(inspectLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-border-theme">
                <span>Recorded: {new Date(inspectLog.createdAt).toLocaleString("en-IN")}</span>
                <span>Module: {inspectLog.module}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
