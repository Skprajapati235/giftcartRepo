"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  ShoppingBag,
  IndianRupee,
  Share2,
  Calendar,
  Layers,
  ArrowUpRight,
  Package,
  CreditCard,
  Wallet,
  Trophy,
  LifeBuoy,
  CheckCircle2,
  Clock,
  Filter,
  Users2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { InventorySummary } from "../../services/inventoryService";

interface DashboardChartsProps {
  orders: any[];
  payments?: any[];
  leads?: any[];
  inventorySummary?: InventorySummary | null;
  supportData?: {
    tickets: any[];
    counts?: {
      total: number;
      pending: number;
      in_progress: number;
      resolved: number;
      closed?: number;
    };
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  Delivered: "#10b981", // emerald-500
  Shipped: "#0ea5e9",   // sky-500
  Processing: "#6366f1",// indigo-500
  Pending: "#f59e0b",   // amber-500
  Cancelled: "#f43f5e", // rose-500
};

const LEAD_SOURCE_INFO: Record<
  string,
  { label: string; icon: string; color: string; barColor: string }
> = {
  instagram: { label: "Instagram", icon: "📸", color: "text-pink-600 bg-pink-500/10 border-pink-500/20", barColor: "#ec4899" },
  whatsapp: { label: "WhatsApp", icon: "💬", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", barColor: "#10b981" },
  website: { label: "Website Store", icon: "🌐", color: "text-blue-600 bg-blue-500/10 border-blue-500/20", barColor: "#3b82f6" },
  facebook: { label: "Facebook", icon: "📘", color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20", barColor: "#6366f1" },
  google: { label: "Google Search", icon: "🔍", color: "text-amber-600 bg-amber-500/10 border-amber-500/20", barColor: "#f59e0b" },
  phone: { label: "Phone Call", icon: "📞", color: "text-purple-600 bg-purple-500/10 border-purple-500/20", barColor: "#a855f7" },
  referral: { label: "Customer Referral", icon: "🎁", color: "text-teal-600 bg-teal-500/10 border-teal-500/20", barColor: "#14b8a6" },
  advertisement: { label: "Paid Ads", icon: "📢", color: "text-rose-600 bg-rose-500/10 border-rose-500/20", barColor: "#f43f5e" },
  offline: { label: "Offline Store", icon: "🏪", color: "text-slate-600 bg-slate-500/10 border-slate-500/20", barColor: "#64748b" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DashboardCharts({
  orders = [],
  payments = [],
  leads = [],
  inventorySummary,
  supportData,
}: DashboardChartsProps) {
  const [metricMode, setMetricMode] = useState<"revenue" | "orders">("revenue");
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "6m">("6m");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Order status counts (100% real)
  const statusCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {
      Delivered: 0,
      Shipped: 0,
      Processing: 0,
      Pending: 0,
      Cancelled: 0,
    };
    orders.forEach((o) => {
      const st = o.status || "Pending";
      if (counts[st] !== undefined) {
        counts[st] += 1;
      } else {
        counts["Pending"] += 1;
      }
    });
    return counts;
  }, [orders]);

  const pieData = useMemo(() => {
    const data = Object.entries(statusCounts)
      .map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLORS[name] || "#64748b",
      }))
      .filter((s) => s.value > 0);

    return data.length > 0 ? data : [{ name: "No Orders Yet", value: 1, color: "#94a3b8" }];
  }, [statusCounts]);

  const totalOrdersCount = orders.length;

  // 2. Trend data based on selected timeframe (100% real)
  const chartData = useMemo(() => {
    if (timeframe === "7d") {
      const days: Array<{ label: string; dateKey: string; revenue: number; orders: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split("T")[0];
        const dayLabel = d.toLocaleDateString("en-IN", { weekday: "short" });
        days.push({ label: dayLabel, dateKey, revenue: 0, orders: 0 });
      }

      orders.forEach((o) => {
        if (!o.createdAt) return;
        const dKey = o.createdAt.split("T")[0];
        const match = days.find((item) => item.dateKey === dKey);
        if (match) {
          match.orders += 1;
          match.revenue += Number(o.totalAmount) || 0;
        }
      });

      payments.forEach((p) => {
        if (!p.createdAt) return;
        const dKey = p.createdAt.split("T")[0];
        const match = days.find((item) => item.dateKey === dKey);
        if (match && match.revenue === 0) {
          match.revenue += Number(p.totalAmount) || 0;
        }
      });

      return days;
    }

    if (timeframe === "30d") {
      const weeks: Array<{ label: string; revenue: number; orders: number }> = [
        { label: "W1", revenue: 0, orders: 0 },
        { label: "W2", revenue: 0, orders: 0 },
        { label: "W3", revenue: 0, orders: 0 },
        { label: "W4", revenue: 0, orders: 0 },
      ];

      orders.forEach((o) => {
        if (!o.createdAt) return;
        const diffDays = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) weeks[3].orders += 1;
        else if (diffDays <= 14) weeks[2].orders += 1;
        else if (diffDays <= 21) weeks[1].orders += 1;
        else if (diffDays <= 30) weeks[0].orders += 1;
      });

      payments.forEach((p) => {
        if (!p.createdAt) return;
        const diffDays = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const amt = Number(p.totalAmount) || 0;
        if (diffDays <= 7) weeks[3].revenue += amt;
        else if (diffDays <= 14) weeks[2].revenue += amt;
        else if (diffDays <= 21) weeks[1].revenue += amt;
        else if (diffDays <= 30) weeks[0].revenue += amt;
      });

      return weeks;
    }

    // Default: 6 months
    const monthMap = Array.from({ length: 6 }).reduce<
      Array<{ label: string; monthIndex: number; year: number; revenue: number; orders: number }>
    >((acc, _, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      acc.push({
        label: MONTHS[date.getMonth()],
        monthIndex: date.getMonth(),
        year: date.getFullYear(),
        revenue: 0,
        orders: 0,
      });
      return acc;
    }, []);

    orders.forEach((o) => {
      const d = new Date(o.createdAt || Date.now());
      const match = monthMap.find(
        (m) => m.monthIndex === d.getMonth() && m.year === d.getFullYear()
      );
      if (match) {
        match.orders += 1;
        match.revenue += Number(o.totalAmount) || 0;
      }
    });

    payments.forEach((p) => {
      const d = new Date(p.createdAt || Date.now());
      const match = monthMap.find(
        (m) => m.monthIndex === d.getMonth() && m.year === d.getFullYear()
      );
      if (match && match.revenue === 0) {
        match.revenue += Number(p.totalAmount) || 0;
      }
    });

    return monthMap;
  }, [orders, payments, timeframe]);

  // 3. Top-selling products extracted 100% from real orders
  const topProducts = useMemo(() => {
    const productMap: Record<string, { name: string; quantity: number; totalRevenue: number }> = {};
    orders.forEach((order) => {
      (order.items || []).forEach((item: any) => {
        const name = item.name || "Custom Gift Product";
        if (!productMap[name]) {
          productMap[name] = { name, quantity: 0, totalRevenue: 0 };
        }
        productMap[name].quantity += Number(item.quantity) || 1;
        productMap[name].totalRevenue +=
          Number(item.itemTotal || (item.price * (item.quantity || 1))) || 0;
      });
    });

    return Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  const maxProductQuantity = useMemo(() => {
    if (topProducts.length === 0) return 1;
    return Math.max(...topProducts.map((p) => p.quantity), 1);
  }, [topProducts]);

  // 4. Payment method split (COD vs Online/Razorpay) 100% from real orders
  const paymentMethodStats = useMemo(() => {
    let codCount = 0;
    let codAmount = 0;
    let onlineCount = 0;
    let onlineAmount = 0;

    orders.forEach((o) => {
      const method = (o.paymentMethod || "Online").toUpperCase();
      const amt = Number(o.totalAmount) || 0;
      if (method === "COD") {
        codCount += 1;
        codAmount += amt;
      } else {
        onlineCount += 1;
        onlineAmount += amt;
      }
    });

    const total = orders.length;
    const onlinePct = total > 0 ? Math.round((onlineCount / total) * 100) : 0;
    const codPct = total > 0 ? Math.round((codCount / total) * 100) : 0;

    return { codCount, codAmount, onlineCount, onlineAmount, total, onlinePct, codPct };
  }, [orders]);

  // 5. Omnichannel lead acquisition (100% real)
  const leadSourceStats = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((lead) => {
      const src = (lead.source || "website").toLowerCase();
      counts[src] = (counts[src] || 0) + 1;
    });

    const sources = ["instagram", "whatsapp", "website", "facebook", "google", "phone"];
    const totalCount = leads.length;

    return sources.map((key) => {
      const count = counts[key] || 0;
      const info = LEAD_SOURCE_INFO[key] || {
        label: key,
        icon: "✨",
        color: "text-slate-600 bg-slate-100",
        barColor: "#3b82f6",
      };
      const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      return {
        key,
        label: info.label,
        icon: info.icon,
        color: info.color,
        barColor: info.barColor,
        count,
        pct,
      };
    });
  }, [leads]);

  // 6. CRM Lead Pipeline Stages (100% real)
  const leadPipelineStages = useMemo(() => {
    const statusMap: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      INTERESTED: 0,
      OFFER_SENT: 0,
      CONVERTED: 0,
      LOST: 0,
    };

    leads.forEach((l) => {
      const st = (l.status || "NEW").toUpperCase();
      if (statusMap[st] !== undefined) {
        statusMap[st] += 1;
      } else {
        statusMap["NEW"] += 1;
      }
    });

    const stages = [
      { key: "NEW", label: "New Inquiry", count: statusMap.NEW, color: "#3b82f6" },
      { key: "CONTACTED", label: "Contacted", count: statusMap.CONTACTED, color: "#a855f7" },
      { key: "INTERESTED", label: "Interested", count: statusMap.INTERESTED, color: "#f59e0b" },
      { key: "OFFER_SENT", label: "Offer Sent", count: statusMap.OFFER_SENT, color: "#0ea5e9" },
      { key: "CONVERTED", label: "Converted", count: statusMap.CONVERTED, color: "#10b981" },
      { key: "LOST", label: "Lost", count: statusMap.LOST, color: "#f43f5e" },
    ];

    const total = leads.length;
    const conversionRate = total > 0 ? Math.round((statusMap.CONVERTED / total) * 100) : 0;

    return { stages, total, conversionRate };
  }, [leads]);

  // 7. Customer Support Resolution Health (100% real)
  const supportStats = useMemo(() => {
    const counts = supportData?.counts || {
      total: supportData?.tickets?.length || 0,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };
    const total = counts.total || 0;
    const resolved = counts.resolved || 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { counts, total, resolutionRate };
  }, [supportData]);

  // 8. Category breakdown (100% real from database)
  const categoryBreakdown = useMemo(() => {
    if (inventorySummary?.categoryBreakdown && inventorySummary.categoryBreakdown.length > 0) {
      return inventorySummary.categoryBreakdown.slice(0, 6);
    }
    return [];
  }, [inventorySummary]);

  const totalPeriodRevenue = chartData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalPeriodOrders = chartData.reduce((acc, curr) => acc + curr.orders, 0);

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* ── ROW 1: PRIMARY SALES & ORDER REVENUE AREA CHART ── */}
      <div className="rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm transition-all hover:shadow-md">
        {/* Chart Top Header & Controls */}
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between mb-2.5">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Sales & Revenue Analytics
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium">
              Real-time payment settlements and customer orders flow
            </p>
          </div>

          {/* Toggle Controls: Mode (Revenue / Orders) & Timeframe */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Mode Toggle */}
            <div className="inline-flex rounded-xl border border-border-theme bg-background p-0.5 shadow-2xs">
              <button
                onClick={() => setMetricMode("revenue")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  metricMode === "revenue"
                    ? "bg-primary text-white shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <IndianRupee className="h-3 w-3" />
                <span>Revenue (₹)</span>
              </button>
              <button
                onClick={() => setMetricMode("orders")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  metricMode === "orders"
                    ? "bg-primary text-white shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <ShoppingBag className="h-3 w-3" />
                <span>Orders</span>
              </button>
            </div>

            {/* Timeframe selector */}
            <div className="inline-flex rounded-xl border border-border-theme bg-background p-0.5 shadow-2xs">
              {(["7d", "30d", "6m"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    timeframe === tf
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  {tf === "7d" ? "7D" : tf === "30d" ? "30D" : "6M"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Highlight Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3 p-2.5 sm:p-3 rounded-xl border border-border-theme bg-background/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Period Total Revenue
            </span>
            <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
              ₹{totalPeriodRevenue.toLocaleString("en-IN")}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Period Orders Placed
            </span>
            <div className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400">
              {totalPeriodOrders} Orders
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Average Order Run Rate
            </span>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              ₹{totalPeriodOrders > 0 ? Math.round(totalPeriodRevenue / totalPeriodOrders).toLocaleString("en-IN") : 0}
            </div>
          </div>
        </div>

        {/* Area Chart Container */}
        <div className="w-full min-w-0 h-[200px] sm:h-[220px]">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={metricMode === "revenue" ? "#10b981" : "#3b82f6"}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={metricMode === "revenue" ? "#10b981" : "#3b82f6"}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                  dy={6}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                  tickFormatter={(val) =>
                    metricMode === "revenue" ? `₹${val > 999 ? `${Math.round(val / 1000)}k` : val}` : val
                  }
                />
                <RechartsTooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1.5 }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                    padding: "8px 12px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: 800, marginBottom: 2 }}
                  formatter={(val: any) => [
                    metricMode === "revenue" ? `₹${Number(val).toLocaleString("en-IN")}` : `${val} Orders`,
                    metricMode === "revenue" ? "Revenue" : "Orders",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={metricMode === "revenue" ? "revenue" : "orders"}
                  stroke={metricMode === "revenue" ? "#10b981" : "#3b82f6"}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#chartAreaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full rounded-xl bg-slate-100 dark:bg-slate-800/40 animate-pulse" />
          )}
        </div>
      </div>

      {/* ── ROW 2: BEST SELLING PRODUCTS + PAYMENT MODES ── */}
      <div className="grid gap-3.5 sm:gap-4 lg:grid-cols-12">
        {/* 1. Top Performing Best Sellers (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm transition-all hover:shadow-md">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Top-Selling Products Leaderboard
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    Calculated directly from customer purchase volumes
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Top {topProducts.length}
              </span>
            </div>

            {topProducts.length > 0 ? (
              <div className="mt-3 space-y-2.5">
                {topProducts.map((prod, idx) => {
                  const pct = Math.round((prod.quantity / maxProductQuantity) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <div className="flex items-center gap-1.5 max-w-[70%]">
                          <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-700 dark:text-slate-300">
                            #{idx + 1}
                          </span>
                          <span className="truncate text-slate-900 dark:text-white" title={prod.name}>
                            {prod.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">
                            ₹{prod.totalRevenue.toLocaleString("en-IN")}
                          </span>
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1 py-0.2 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                            {prod.quantity} sold
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                          style={{ width: `${Math.max(pct, 6)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <ShoppingBag className="h-7 w-7 text-slate-400 mb-1.5" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No products sold yet
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Top selling products will automatically rank here once orders arrive.
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-border-theme flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            <span>Ranked by unit sales</span>
            <Link
              href="/products"
              className="text-primary font-bold hover:underline inline-flex items-center gap-1"
            >
              Catalog <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 2. Payment Modes & Settlement Health (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm transition-all hover:shadow-md">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-600">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Payment Gateway Split
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    Prepaid digital transactions vs Cash on Delivery
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-2.5 space-y-3">
              {/* Online vs COD split cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Wallet className="h-3 w-3" /> Online
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-600">
                      {paymentMethodStats.onlinePct}%
                    </span>
                  </div>
                  <div className="text-base font-black text-slate-950 dark:text-white">
                    ₹{paymentMethodStats.onlineAmount.toLocaleString("en-IN")}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {paymentMethodStats.onlineCount} orders paid
                  </span>
                </div>

                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-2.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                      <ShoppingBag className="h-3 w-3" /> COD
                    </span>
                    <span className="text-[10px] font-mono font-bold text-indigo-600">
                      {paymentMethodStats.codPct}%
                    </span>
                  </div>
                  <div className="text-base font-black text-slate-950 dark:text-white">
                    ₹{paymentMethodStats.codAmount.toLocaleString("en-IN")}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {paymentMethodStats.codCount} orders COD
                  </span>
                </div>
              </div>

              {/* Progress Dual Bar */}
              <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${paymentMethodStats.onlinePct}%` }}
                    title={`Online: ${paymentMethodStats.onlinePct}%`}
                  />
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${paymentMethodStats.codPct}%` }}
                    title={`COD: ${paymentMethodStats.codPct}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-bold px-0.5">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Online ({paymentMethodStats.onlineCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    COD ({paymentMethodStats.codCount})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-border-theme flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            <span>Razorpay Verified</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Live Gateway
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 3: OMNICHANNEL LEADS + CRM PIPELINE FUNNEL ── */}
      <div className="grid gap-3.5 sm:gap-4 lg:grid-cols-12">
        {/* 1. Omnichannel Lead Acquisition (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm transition-all hover:shadow-md">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-pink-500/10 p-1.5 text-pink-600">
                  <Share2 className="h-4 w-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Omnichannel Lead Acquisition
                </h3>
              </div>
              <span className="text-[10px] font-bold text-primary">
                {leads.length} Active Leads
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-3">
              Traffic & customer inquiries tracked across sales channels
            </p>

            {/* Channels Progress Bars */}
            <div className="space-y-2">
              {leadSourceStats.map((src) => (
                <div key={src.key} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                      <span>{src.icon}</span>
                      <span>{src.label}</span>
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                      {src.count} leads {src.pct > 0 && `(${src.pct}%)`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${src.pct > 0 ? src.pct : src.count > 0 ? 8 : 0}%`,
                        backgroundColor: src.barColor,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-border-theme flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            <span>Instagram, WhatsApp, Facebook, Web</span>
            <Link href="/leads" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
              CRM <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 2. CRM Lead Conversion Pipeline Funnel (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm transition-all hover:shadow-md">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-purple-500/10 p-1.5 text-purple-600">
                  <Filter className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    CRM Lead Pipeline & Funnel
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    Lifecycle conversion stages from inquiry to sale
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {leadPipelineStages.conversionRate}% Conversion
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {leadPipelineStages.stages.map((st) => {
                const pct =
                  leadPipelineStages.total > 0
                    ? Math.round((st.count / leadPipelineStages.total) * 100)
                    : 0;
                return (
                  <div key={st.key} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-800 dark:text-slate-200">
                        {st.label}
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-400 text-[10px]">
                        {st.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct > 0 ? pct : st.count > 0 ? 6 : 0}%`,
                          backgroundColor: st.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-border-theme flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            <span>Automated pipeline tracker</span>
            <span className="text-purple-600 font-bold">
              {leadPipelineStages.total} Total
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 4: FULFILLMENT STATUS DONUT + CUSTOMER SUPPORT HEALTH ── */}
      <div className="grid gap-3.5 sm:gap-4 lg:grid-cols-12">
        {/* 1. Order Fulfillment Status (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm transition-all hover:shadow-md">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-secondary/10 p-1.5 text-secondary">
                  <PieIcon className="h-4 w-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Fulfillment Status Breakdown
                </h3>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-2">
              Real-time distribution across active order stages
            </p>
          </div>

          {/* Donut Chart Container with Center Summary */}
          <div className="relative h-[160px] w-full min-w-0 flex items-center justify-center">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.25)",
                      background: "var(--card)",
                      color: "var(--foreground)",
                      padding: "6px 10px",
                      fontSize: "11px",
                    }}
                    labelStyle={{ color: "var(--foreground)", fontWeight: 700 }}
                    itemStyle={{ color: "var(--foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-32 w-32 rounded-full border-4 border-primary/20 animate-pulse" />
            )}

            {/* Centered KPI Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-950 dark:text-white">
                {totalOrdersCount}
              </span>
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-500">
                Orders
              </span>
            </div>
          </div>

          {/* Status Chips */}
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2 border-t border-border-theme">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Delivered ({statusCounts["Delivered"] || 0})</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span>Shipped ({statusCounts["Shipped"] || 0})</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span>Processing ({statusCounts["Processing"] || 0})</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Pending ({statusCounts["Pending"] || 0})</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Cancelled ({statusCounts["Cancelled"] || 0})</span>
            </div>
          </div>
        </div>

        {/* 2. Customer Support & Resolution Health (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm transition-all hover:shadow-md">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-teal-500/10 p-1.5 text-teal-600">
                  <LifeBuoy className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Support Ticket Health
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    Customer queries & pending queue
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                {supportStats.resolutionRate}% Resolved
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2 text-center">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  Pending
                </span>
                <div className="text-lg font-black text-amber-600 mt-0.5">
                  {supportStats.counts.pending}
                </div>
                <span className="text-[9px] text-slate-500">Need reply</span>
              </div>

              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-2 text-center">
                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400">
                  In Progress
                </span>
                <div className="text-lg font-black text-sky-600 mt-0.5">
                  {supportStats.counts.in_progress}
                </div>
                <span className="text-[9px] text-slate-500">Under review</span>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2 text-center">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  Resolved
                </span>
                <div className="text-lg font-black text-emerald-600 mt-0.5">
                  {supportStats.counts.resolved}
                </div>
                <span className="text-[9px] text-slate-500">Completed</span>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-background border border-border-theme space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-800 dark:text-slate-200">Overall Ticket Resolution</span>
                <span className="font-mono text-primary text-[11px]">{supportStats.resolutionRate}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${supportStats.resolutionRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-border-theme flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            <span>Total Tickets: {supportStats.total}</span>
            <Link href="/support" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
              Support Desk <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── ROW 5: CATEGORY VALUATION & CATALOG HEALTH ── */}
      <div className="rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Category Stock Valuation & Share
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                Warehouse inventory distribution across real gift collections
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-background border border-border-theme px-2.5 py-1 rounded-lg">
            <Layers className="h-3 w-3 text-primary" />
            <span>Catalog: {inventorySummary?.totalProducts || 0} items</span>
          </span>
        </div>

        {categoryBreakdown.length > 0 ? (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryBreakdown.map((cat, i) => (
              <div
                key={i}
                className="rounded-xl border border-border-theme bg-background p-3 space-y-1 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {cat.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-primary">
                    {cat.productCount} skus
                  </span>
                </div>
                <div className="text-base font-black text-slate-950 dark:text-white">
                  ₹{(cat.totalValue || 0).toLocaleString("en-IN")}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                  <span>In stock:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{cat.totalStock || 0} units</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center rounded-xl border border-dashed border-border-theme p-4">
            <Package className="h-8 w-8 text-slate-400 mb-1.5" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No inventory categories found
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 mb-2.5">
              Add products with categories to view live warehouse valuation and stock share.
            </p>
            <Link
              href="/product/add"
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:bg-primary/90 transition-colors"
            >
              + Add Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
