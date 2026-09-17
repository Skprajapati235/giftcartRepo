"use client";

import React from "react";
import { LifeBuoy, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface SupportStatsProps {
  counts?: {
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
  };
  activeStatus: string;
  onSelectStatus: (status: "all" | "pending" | "in_progress" | "resolved" | "closed") => void;
  loading: boolean;
}

export default function SupportStats({
  counts,
  activeStatus,
  onSelectStatus,
  loading,
}: SupportStatsProps) {
  if (loading && !counts) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-border-theme bg-card/60 animate-pulse p-4"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: "all",
      label: "Total Inquiries",
      value: counts?.total ?? 0,
      subtext: "All customer tickets",
      icon: LifeBuoy,
      gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
      iconColor: "text-blue-500",
      activeRing: "ring-2 ring-blue-500",
      statusKey: "all" as const,
    },
    {
      id: "pending",
      label: "Pending Response",
      value: counts?.pending ?? 0,
      subtext: "Awaiting review",
      icon: Clock,
      gradient: "from-amber-500/10 via-yellow-500/5 to-transparent",
      iconColor: "text-amber-500",
      activeRing: "ring-2 ring-amber-500",
      statusKey: "pending" as const,
    },
    {
      id: "in_progress",
      label: "In Progress",
      value: counts?.in_progress ?? 0,
      subtext: "Being handled",
      icon: AlertCircle,
      gradient: "from-sky-500/10 via-cyan-500/5 to-transparent",
      iconColor: "text-sky-500",
      activeRing: "ring-2 ring-sky-500",
      statusKey: "in_progress" as const,
    },
    {
      id: "resolved",
      label: "Resolved",
      value: counts?.resolved ?? 0,
      subtext: "Successfully closed",
      icon: CheckCircle2,
      gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
      iconColor: "text-emerald-500",
      activeRing: "ring-2 ring-emerald-500",
      statusKey: "resolved" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-6">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = activeStatus === c.statusKey;

        return (
          <div
            key={c.id}
            onClick={() => onSelectStatus(c.statusKey)}
            className={`relative overflow-hidden rounded-2xl border border-border-theme bg-card p-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/40 ${
              isSelected ? c.activeRing : ""
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} pointer-events-none`} />

            <div className="relative flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                {c.label}
              </span>
              <div className={`rounded-xl p-2 bg-background border border-border-theme ${c.iconColor}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="relative">
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {c.value}
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {c.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
