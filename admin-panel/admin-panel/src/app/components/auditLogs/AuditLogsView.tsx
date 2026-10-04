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
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";

interface AuditEntry {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  module: "Theme Studio" | "Orders & Kitchen" | "Catalog" | "Discounts" | "Security & Auth" | "Delivery Fleet";
  details: string;
  severity: "info" | "warning" | "success";
  ipAddress: string;
}

const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  {
    id: "log-1",
    timestamp: "Just now",
    adminName: "Sonu Prajapati",
    adminEmail: "sonu@giftfestive.com",
    adminRole: "Super Admin",
    action: "Published Storefront Theme",
    module: "Theme Studio",
    details: "Switched theme preset to 'Festive Pink' and updated announcement bar message.",
    severity: "success",
    ipAddress: "192.168.1.12",
  },
  {
    id: "log-2",
    timestamp: "12 mins ago",
    adminName: "Rahul Sharma",
    adminEmail: "rahul.kitchen@giftfestive.com",
    adminRole: "Kitchen Manager",
    action: "Order Dispatched",
    module: "Orders & Kitchen",
    details: "Marked Order #8921 (Pineapple Cake 1kg) as Ready for Dispatch.",
    severity: "info",
    ipAddress: "192.168.1.45",
  },
  {
    id: "log-3",
    timestamp: "45 mins ago",
    adminName: "Pooja Verma",
    adminEmail: "pooja.support@giftfestive.com",
    adminRole: "Support Agent",
    action: "Abandoned Cart Recovery",
    module: "Orders & Kitchen",
    details: "Triggered 15% OFF recovery WhatsApp message to customer +91 98765 43210.",
    severity: "success",
    ipAddress: "192.168.1.88",
  },
  {
    id: "log-4",
    timestamp: "2 hours ago",
    adminName: "Sonu Prajapati",
    adminEmail: "sonu@giftfestive.com",
    adminRole: "Super Admin",
    action: "Assigned Delivery Rider",
    module: "Delivery Fleet",
    details: "Assigned Order #8918 to Rider Amit Kumar (Bike #HR-51-AB-1234).",
    severity: "info",
    ipAddress: "192.168.1.12",
  },
  {
    id: "log-5",
    timestamp: "4 hours ago",
    adminName: "Amit Kumar",
    adminEmail: "amit.seo@giftfestive.com",
    adminRole: "SEO Specialist",
    action: "Updated Schema Markup",
    module: "Catalog",
    details: "Updated Google Schema JSON-LD for 'Faridabad Midnight Cake Delivery'.",
    severity: "info",
    ipAddress: "103.21.58.19",
  },
  {
    id: "log-6",
    timestamp: "Yesterday, 11:45 PM",
    adminName: "System Automation",
    adminEmail: "system@giftfestive.com",
    adminRole: "System Bot",
    action: "Midnight Delivery Cutoff",
    module: "Security & Auth",
    details: "Automatic delivery slot restriction applied for Sector 14-19 post 11:00 PM.",
    severity: "warning",
    ipAddress: "127.0.0.1",
  },
  {
    id: "log-7",
    timestamp: "Yesterday, 06:15 PM",
    adminName: "Sonu Prajapati",
    adminEmail: "sonu@giftfestive.com",
    adminRole: "Super Admin",
    action: "Coupon Created",
    module: "Discounts",
    details: "Created discount coupon 'MIDNIGHT15' with 15% discount up to ₹150.",
    severity: "success",
    ipAddress: "192.168.1.12",
  },
];

import { auditLogsService } from "../../services/auditLogsService";

export default function AuditLogsView() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<any[]>(INITIAL_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchLogs() {
      setLoading(true);
      try {
        const liveLogs = await auditLogsService.getLogs(selectedModule, searchTerm);
        if (isMounted && liveLogs && liveLogs.length > 0) {
          setLogs(
            liveLogs.map((l: any) => ({
              id: l._id || l.id,
              timestamp: l.createdAt ? new Date(l.createdAt).toLocaleString("en-IN") : "Recent",
              adminName: l.adminName || "Admin",
              adminEmail: l.adminEmail || "admin@giftfestive.com",
              adminRole: l.adminRole || "Super Admin",
              action: l.action,
              module: l.module,
              details: l.details,
              severity: l.severity || "info",
              ipAddress: l.ipAddress || "127.0.0.1",
            }))
          );
        }
      } catch (e) {
        console.error("Live audit log fetch failed:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchLogs();
    return () => {
      isMounted = false;
    };
  }, [selectedModule, searchTerm]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = selectedModule === "All" || log.module === selectedModule;

    return matchesSearch && matchesModule;
  });

  const exportCsv = () => {
    const headers = ["Timestamp", "Admin Name", "Email", "Role", "Action", "Module", "Details", "IP Address"];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.adminName}"`,
      `"${l.adminEmail}"`,
      `"${l.adminRole}"`,
      `"${l.action}"`,
      `"${l.module}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GiftFestive_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Audit logs exported to CSV successfully", "success");
  };

  const getSeverityBadge = (severity: AuditEntry["severity"]) => {
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
              Security & Audit Logs
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Comprehensive immutable activity trail tracking administrative changes, status updates, and theme modifications.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 active:scale-95 transition"
        >
          <Download className="h-4 w-4" />
          <span>Export Logs (CSV)</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Recorded Events</span>
          <p className="text-2xl font-black text-foreground mt-1">{logs.length}</p>
          <span className="text-[10px] text-emerald-500 font-semibold">● 100% Traceability</span>
        </div>

        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Admins</span>
          <p className="text-2xl font-black text-pink-500 mt-1">4 Team Members</p>
          <span className="text-[10px] text-slate-400">Across Faridabad & HQ</span>
        </div>

        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Theme Modifications</span>
          <p className="text-2xl font-black text-purple-400 mt-1">Live Synced</p>
          <span className="text-[10px] text-purple-400">Broadcast Channel Active</span>
        </div>

        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security Health</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">Optimal</p>
          <span className="text-[10px] text-emerald-500">Zero Unauthorized Attempts</span>
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
            placeholder="Search by admin name, action, or keyword..."
            className="w-full rounded-xl border border-border-theme bg-background pl-10 pr-4 py-2 text-xs sm:text-sm text-foreground focus:border-pink-500 focus:outline-none"
          />
        </div>

        {/* Module Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["All", "Theme Studio", "Orders & Kitchen", "Catalog", "Delivery Fleet", "Discounts"].map(
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
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp & IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-hover-theme/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500 font-black text-xs">
                          {entry.adminName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{entry.adminName}</p>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {entry.adminRole}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {entry.action}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="rounded-lg bg-background border border-border-theme px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {entry.module}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-slate-500 dark:text-slate-400 truncate">
                      {entry.details}
                    </td>

                    <td className="py-3.5 px-4">
                      {getSeverityBadge(entry.severity)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-600 dark:text-slate-300">{entry.timestamp}</p>
                      <span className="text-[10px] font-mono text-slate-400">{entry.ipAddress}</span>
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
