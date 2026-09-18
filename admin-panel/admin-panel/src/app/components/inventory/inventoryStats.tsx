"use client";

import React from "react";
import { Package, Layers, TrendingUp, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { InventorySummary } from "../../services/inventoryService";

interface InventoryStatsProps {
  summary: InventorySummary | null;
  loading: boolean;
  activeStatus: string;
  onSelectStatus: (status: "all" | "in_stock" | "low_stock" | "out_of_stock") => void;
}

export default function InventoryStats({
  summary,
  loading,
  activeStatus,
  onSelectStatus,
}: InventoryStatsProps) {
  if (loading && !summary) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-border-theme bg-card/60 animate-pulse p-4"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: "all",
      label: "Total Products",
      value: summary?.totalProducts ?? 0,
      subtext: `${summary?.categoriesCount ?? 0} Categories`,
      icon: Package,
      gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/20",
      activeRing: "ring-2 ring-blue-500",
      statusKey: "all" as const,
    },
    {
      id: "stock",
      label: "Total Units in Stock",
      value: (summary?.totalStock ?? 0).toLocaleString("en-IN"),
      subtext: "Across warehouse",
      icon: Layers,
      gradient: "from-sky-500/10 via-cyan-500/5 to-transparent",
      iconColor: "text-sky-500",
      borderColor: "border-sky-500/20",
      activeRing: "",
      statusKey: null,
    },
    {
      id: "valuation",
      label: "Inventory Value",
      value: `₹${(summary?.totalValueSelling ?? 0).toLocaleString("en-IN")}`,
      subtext: `MRP: ₹${(summary?.totalValueMRP ?? 0).toLocaleString("en-IN")}`,
      icon: TrendingUp,
      gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
      activeRing: "",
      statusKey: null,
    },
    {
      id: "low_stock",
      label: "Low Stock Alert",
      value: summary?.lowStockCount ?? 0,
      subtext: "Restock needed soon",
      icon: AlertTriangle,
      gradient: "from-amber-500/10 via-yellow-500/5 to-transparent",
      iconColor: "text-amber-500",
      borderColor: "border-amber-500/20",
      activeRing: "ring-2 ring-amber-500",
      statusKey: "low_stock" as const,
    },
    {
      id: "out_of_stock",
      label: "Out of Stock",
      value: summary?.outOfStockCount ?? 0,
      subtext: "Immediate action",
      icon: XCircle,
      gradient: "from-rose-500/10 via-red-500/5 to-transparent",
      iconColor: "text-rose-500",
      borderColor: "border-rose-500/20",
      activeRing: "ring-2 ring-rose-500",
      statusKey: "out_of_stock" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4 mb-6">
      {cards.map((c) => {
        const Icon = c.icon;
        const isClickable = !!c.statusKey;
        const isSelected = c.statusKey && activeStatus === c.statusKey;

        return (
          <div
            key={c.id}
            onClick={() => {
              if (c.statusKey) onSelectStatus(c.statusKey);
            }}
            className={`relative overflow-hidden rounded-2xl border border-border-theme bg-card p-4 transition-all duration-200 ${
              isClickable ? "cursor-pointer hover:shadow-md hover:border-primary/40" : ""
            } ${isSelected ? c.activeRing : ""}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} pointer-events-none`} />

            <div className="relative flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">
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
              <p className="mt-1 text-[12px] text-slate-700 dark:text-slate-300 font-semibold truncate">
                {c.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
