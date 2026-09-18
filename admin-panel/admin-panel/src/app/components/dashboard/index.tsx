"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getAllOrders, getOrderPayments } from "../../services/adminService";
import { getInventorySummary, InventorySummary } from "../../services/inventoryService";
import { getAllLeads } from "../../services/leadService";
import { getDeliveryHours, DeliveryHoursStatus } from "../../services/deliveryHoursService";
import { getSupportTickets } from "../../services/supportService";
import { useAdmin } from "../../context/AdminContext";
import { useAuth } from "../../context/AuthContext";
import { DashboardSkeleton } from "../skeletonLoader/commonSkeleton";
import StatsGrid from "./statsGrid";
import RecentOrder from "./recentOrder";
import PaymentHistory from "./paymentHistory";
import DashboardCharts from "./dashboardCharts";
import Link from "next/link";
import {
  Sparkles,
  RefreshCw,
  PlusCircle,
  ShoppingBag,
  Clock,
  AlertTriangle,
  LifeBuoy,
  TrendingUp,
  Package,
  Layers,
  ArrowUpRight,
  Sun,
  Moon,
  CheckCircle2,
} from "lucide-react";

interface Order {
  _id: string;
  user: { name: string; email: string; phone?: string };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    pinCode: string;
  };
  items: Array<{ name: string; quantity: number; price: number }>;
  createdAt: string;
}

interface Payment {
  _id: string;
  razorpayPaymentId: string;
  totalAmount: number;
  createdAt: string;
}

export default function DashboardView() {
  const { totalProducts, totalUsers, loading: adminLoading, refreshAll } = useAdmin();
  const { token, authenticated, user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const [leads, setLeads] = useState<any[]>([]);
  const [pendingTicketsCount, setPendingTicketsCount] = useState<number>(0);
  const [supportData, setSupportData] = useState<{
    tickets: any[];
    counts?: {
      total: number;
      pending: number;
      in_progress: number;
      resolved: number;
      closed?: number;
    };
  } | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryHoursStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchData = useCallback(async () => {
    if (!authenticated || !token) return;
    try {
      const [ordRes, payRes, invRes, leadRes, delivRes, supportRes] = await Promise.allSettled([
        getAllOrders({ limit: 50 }),
        getOrderPayments(),
        getInventorySummary().catch(() => null),
        getAllLeads({ limit: 100 }).catch(() => ({ total: 0, leads: [] })),
        getDeliveryHours().catch(() => null),
        getSupportTickets({ limit: 50 }).catch(() => null),
      ]);

      if (ordRes.status === "fulfilled" && ordRes.value) {
        const ordersArray = ordRes.value.data || ordRes.value;
        setOrders(Array.isArray(ordersArray) ? ordersArray : []);
        setTotalOrders(ordRes.value.total || (Array.isArray(ordRes.value) ? ordRes.value.length : 0));
      }

      if (payRes.status === "fulfilled" && Array.isArray(payRes.value)) {
        setPayments(payRes.value);
      }

      if (invRes.status === "fulfilled" && invRes.value) {
        setInventorySummary(invRes.value);
      }

      if (leadRes.status === "fulfilled" && leadRes.value) {
        setLeadsCount(leadRes.value.total || 0);
        const leadsArr = leadRes.value.leads || leadRes.value.data || [];
        setLeads(Array.isArray(leadsArr) ? leadsArr : []);
      }

      if (delivRes.status === "fulfilled" && delivRes.value) {
        setDeliveryStatus(delivRes.value);
      }

      if (supportRes.status === "fulfilled" && supportRes.value) {
        const val = supportRes.value;
        const tickets = Array.isArray(val.data) ? val.data : [];
        const counts = val.counts || {
          total: val.total || tickets.length,
          pending: tickets.filter((t: any) => t.status === "pending").length,
          in_progress: tickets.filter((t: any) => t.status === "in_progress").length,
          resolved: tickets.filter((t: any) => t.status === "resolved").length,
        };
        setSupportData({ tickets, counts });
        setPendingTicketsCount(counts.pending ?? 0);
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticated, token]);

  useEffect(() => {
    if (authenticated && token) {
      fetchData();
    }
  }, [authenticated, token, fetchData]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      fetchData(),
      refreshAll().catch(() => {}),
    ]);
    setRefreshing(false);
  };

  const totalRevenue = payments.reduce((acc, curr) => acc + curr.totalAmount, 0);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const isRestrictedActive = deliveryStatus?.isRestricted;
  const isNightClosed = deliveryStatus?.isCurrentlyRestricted;

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* 1. Header Banner: Greeting + Live Store Status + Quick Actions */}
      <div className="relative overflow-hidden rounded-2xl border border-border-theme bg-card p-4 sm:p-5 shadow-sm">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-16 h-48 w-48 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                <Sparkles className="h-3 w-3" />
                <span>Admin Command Center</span>
              </span>

              {/* Delivery Operating Pill */}
              <Link
                href="/delivery-hours"
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-colors ${
                  !isRestrictedActive
                    ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-border-theme"
                    : isNightClosed
                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    !isRestrictedActive
                      ? "bg-slate-400"
                      : isNightClosed
                      ? "bg-rose-500 animate-pulse"
                      : "bg-emerald-500 animate-pulse"
                  }`}
                />
                <span>
                  {!isRestrictedActive
                    ? "24/7 Delivery Open"
                    : isNightClosed
                    ? "🌙 Night Pause Active"
                    : "🟢 Deliveries Open"}
                </span>
              </Link>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {getGreeting()}, {user?.name ? user.name.split(" ")[0] : "Admin"} 👋
            </h1>

            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              Real-time snapshot of your e-commerce gift store, orders, revenue, and fulfillment.
            </p>
          </div>

          {/* Action Buttons: Quick Navigation + Refresh */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              title="Refresh Dashboard"
              className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/products"
              className="flex items-center gap-1.5 rounded-xl bg-primary text-white px-3 py-2 text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Product</span>
            </Link>

            <Link
              href="/orders"
              className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-2 text-xs font-bold transition-all cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>View Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Primary KPI Cards Grid */}
      <StatsGrid
        totalRevenue={totalRevenue}
        ordersCount={totalOrders}
        productsCount={totalProducts}
        usersCount={totalUsers}
        lowStockCount={inventorySummary?.lowStockCount || 0}
        leadsCount={leadsCount}
      />

      {/* 3. Operational Highlights Strip (Low Stock Alert, Support Tickets, Inventory Valuation) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Inventory Stock Health */}
        <Link
          href="/inventory"
          className="group relative overflow-hidden rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Inventory Valuation
            </span>
            <div className="rounded-lg p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
            ₹{(inventorySummary?.totalValueSelling || 0).toLocaleString("en-IN")}
          </div>
          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center justify-between">
            <span>{inventorySummary?.totalStock || 0} units stored</span>
            <span className="text-primary font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Manage <ArrowUpRight className="h-3 w-3" />
            </span>
          </p>
        </Link>

        {/* Customer Support Queue */}
        <Link
          href="/support"
          className="group relative overflow-hidden rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Support Inquiries
            </span>
            <div className="rounded-lg p-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <LifeBuoy className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
            {pendingTicketsCount} Pending
          </div>
          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center justify-between">
            <span>Customer tickets in queue</span>
            <span className="text-sky-600 dark:text-sky-400 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Review <ArrowUpRight className="h-3 w-3" />
            </span>
          </p>
        </Link>

        {/* Store Night Delivery Hours */}
        <Link
          href="/delivery-hours"
          className="group relative overflow-hidden rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Operating Window
            </span>
            <div className="rounded-lg p-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
            {isRestrictedActive
              ? `${deliveryStatus?.dailyStart || "23:00"} - ${deliveryStatus?.dailyEnd || "07:00"}`
              : "24/7 Always Open"}
          </div>
          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center justify-between">
            <span>
              {isRestrictedActive ? "Night window active" : "No cutoff active"}
            </span>
            <span className="text-purple-600 dark:text-purple-400 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Configure <ArrowUpRight className="h-3 w-3" />
            </span>
          </p>
        </Link>
      </div>

      {/* 4. Interactive Order Volume & Fulfillment Charts */}
      <DashboardCharts
        orders={orders}
        payments={payments}
        leads={leads}
        inventorySummary={inventorySummary}
        supportData={supportData}
      />

      {/* 5. Recent Activity: Orders & Payments Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentOrder orders={orders} />
        <PaymentHistory payments={payments} />
      </div>
    </div>
  );
}
