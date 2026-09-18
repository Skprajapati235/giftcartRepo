"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  gradient?: string;
  iconColor?: string;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
}

export default function Card({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradient = "from-primary/10 via-primary/5 to-transparent",
  iconColor = "text-primary bg-primary/10 border-primary/20",
  badge,
  badgeColor = "bg-primary/10 text-primary border-primary/20",
  onClick,
}: DashboardCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-border-theme bg-card p-4 sm:p-4.5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Dynamic Background Ambient Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
      />

      {/* Top Row: Icon + Title + Badge */}
      <div className="relative flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-300 group-hover:scale-105 ${iconColor}`}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
          )}
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
              {title}
            </span>
            {badge && (
              <span
                className={`ml-1.5 inline-flex items-center rounded-full border px-1.5 py-0.2 text-[9px] font-bold ${badgeColor}`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {trend && (
          <div
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold border ${
              trend.isPositive
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400"
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-rose-600 dark:text-rose-400" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="relative">
        <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
          {value}
        </div>

        {subtitle && (
          <p className="mt-1 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom subtle progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
