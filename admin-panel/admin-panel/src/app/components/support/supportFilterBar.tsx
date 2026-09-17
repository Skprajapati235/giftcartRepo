"use client";

import React from "react";
import { Search, X, RefreshCw, PlusCircle, Filter } from "lucide-react";

interface SupportFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "pending" | "in_progress" | "resolved" | "closed";
  onStatusChange: (status: "all" | "pending" | "in_progress" | "resolved" | "closed") => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenTestModal: () => void;
  counts?: {
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
  };
}

export default function SupportFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  onRefresh,
  isRefreshing,
  onOpenTestModal,
  counts,
}: SupportFilterBarProps) {
  const statusTabs = [
    { key: "all" as const, label: "All Tickets", count: counts?.total },
    { key: "pending" as const, label: "Pending", count: counts?.pending, color: "text-amber-600" },
    { key: "in_progress" as const, label: "In Progress", count: counts?.in_progress, color: "text-sky-600" },
    { key: "resolved" as const, label: "Resolved", count: counts?.resolved, color: "text-emerald-600" },
  ];

  return (
    <div className="mb-6 space-y-4 rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
      {/* Top Row: Search + Refresh + Test Submit Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by customer, email, phone, subject, order ID..."
            className="w-full rounded-xl border border-border-theme bg-background pl-10 pr-9 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Inquiries"
            className="rounded-xl border border-border-theme bg-background p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </button>

          <button
            onClick={onOpenTestModal}
            className="flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Customer Ticket</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Status Tabs + Priority Filter */}
      <div className="flex flex-col gap-3 pt-2 border-t border-border-theme sm:flex-row sm:items-center sm:justify-between">
        {/* Status Pill Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onStatusChange(tab.key)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-background border border-border-theme text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
                      active
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}
