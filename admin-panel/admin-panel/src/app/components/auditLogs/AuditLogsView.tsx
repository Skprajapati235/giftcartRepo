"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  User,
  Activity,
  Layers,
  Sparkles,
  FileSpreadsheet,
  FileCode,
  RefreshCw,
  HardDriveDownload,
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import { auditLogsService, AuditLogItem } from "../../services/auditLogsService";

export default function AuditLogsView() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("All");
  const [loading, setLoading] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const liveLogs = await auditLogsService.getLogs({
        module: selectedModule,
        search: searchTerm,
      });
      setLogs(liveLogs || []);
    } catch (e: any) {
      console.error("Audit log fetch error:", e);
      showToast(e?.message || "Failed to load audit logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedModule, searchTerm]);

  const handleExport = async (format: "csv" | "json") => {
    setExportingFormat(format);
    try {
      await auditLogsService.exportAuditLogs(format);
      showToast(`Audit logs exported as ${format.toUpperCase()} via secure API`, "success");
      // Refresh the logs to reflect the newly logged export activity
      await fetchLogs();
    } catch (err: any) {
      showToast(err?.message || `Failed to export logs as ${format.toUpperCase()}`, "error");
    } finally {
      setExportingFormat(null);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </span>
        );
      case "danger":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500">
            <AlertTriangle className="h-3 w-3" />
            Critical
          </span>
        );
      case "info":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-500">
            <Info className="h-3 w-3" />
            Info
          </span>
        );
    }
  };

  const getFormatBadge = (format?: string) => {
    if (!format || format === "none") return null;
    const fmt = format.toUpperCase();
    const isPdf = fmt === "PDF";
    const isCsv = fmt === "CSV" || fmt === "EXCEL";
    const isJson = fmt === "JSON";

    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider ${
          isPdf
            ? "bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30"
            : isCsv
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
            : isJson
            ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30"
            : "bg-primary/10 text-primary border border-primary/20"
        }`}
      >
        <HardDriveDownload className="h-2.5 w-2.5" />
        {fmt}
      </span>
    );
  };

  // Metrics derived purely from real MongoDB database
  const totalRecorded = logs.length;
  const uniqueAdmins = Array.from(new Set(logs.map((l) => l.adminEmail).filter(Boolean))).length;
  const totalFileExports = logs.filter((l) => l.format && l.format !== "none").length;
  const warningCount = logs.filter((l) => l.severity === "warning" || l.severity === "danger").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border-theme bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Security & Activity Audit Logs
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time, immutable audit trail tracking all admin activities, database updates, and file downloads (CSV, PDF, JSON).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3 py-2 text-xs font-bold text-foreground hover:bg-hover-theme transition"
            title="Refresh from MongoDB"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport("csv")}
            disabled={Boolean(exportingFormat)}
            className="flex items-center gap-2 rounded-xl bg-pink-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 active:scale-95 transition disabled:opacity-50"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>{exportingFormat === "csv" ? "Exporting..." : "API Export CSV"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport("json")}
            disabled={Boolean(exportingFormat)}
            className="flex items-center gap-2 rounded-xl border border-pink-500/30 bg-pink-500/10 px-3.5 py-2 text-xs font-bold text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 active:scale-95 transition disabled:opacity-50"
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>{exportingFormat === "json" ? "Exporting..." : "API Export JSON"}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar (Real metrics from MongoDB) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Recorded Events</span>
          <p className="text-2xl font-black text-foreground mt-1">{totalRecorded}</p>
          <span className="text-[10px] text-emerald-500 font-semibold">● Live MongoDB Stream</span>
        </div>

        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Admin Authors</span>
          <p className="text-2xl font-black text-pink-500 mt-1">{uniqueAdmins} Accounts</p>
          <span className="text-[10px] text-slate-400">Tracked by Role & IP</span>
        </div>

        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">File Exports Recorded</span>
          <p className="text-2xl font-black text-purple-400 mt-1">{totalFileExports} Downloads</p>
          <span className="text-[10px] text-purple-400">CSV, PDF & JSON Exports</span>
        </div>

        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Alerts & Warnings</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{warningCount} Events</p>
          <span className="text-[10px] text-slate-400">Audited Security Flags</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border-theme bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by admin name, action, or details..."
            className="w-full rounded-xl border border-border-theme bg-background pl-10 pr-4 py-2 text-xs sm:text-sm text-foreground focus:border-pink-500 focus:outline-none"
          />
        </div>

        {/* Module Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["All", "Orders", "Catalog", "Inventory", "Admin Management", "Authentication", "System"].map(
            (mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => setSelectedModule(mod)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedModule === mod
                    ? "bg-pink-500 text-white shadow-xs"
                    : "border border-border-theme bg-background text-slate-600 dark:text-slate-400 hover:bg-hover-theme"
                }`}
              >
                {mod}
              </button>
            )
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-3xl border border-border-theme bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border-theme bg-background/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Admin Member</th>
                <th className="py-3.5 px-4">Action & Format</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp & IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Fetching real-time audit logs from database...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No activity logs recorded yet. Perform an action or download an export to see live logs appear!
                  </td>
                </tr>
              ) : (
                logs.map((entry) => (
                  <tr key={entry._id} className="hover:bg-hover-theme/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500 font-black text-xs uppercase">
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

                    <td className="py-3.5 px-4 max-w-xs text-slate-500 dark:text-slate-400 truncate" title={entry.details}>
                      {entry.details}
                    </td>

                    <td className="py-3.5 px-4">
                      {getSeverityBadge(entry.severity)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-600 dark:text-slate-300">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString("en-IN") : "Just now"}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400">{entry.ipAddress || "127.0.0.1"}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
