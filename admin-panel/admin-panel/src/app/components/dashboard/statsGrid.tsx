"use client";

import React from "react";
import Card from "./card";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface StatsGridProps {
  totalRevenue: number;
  ordersCount: number;
  productsCount: number;
  usersCount: number;
  lowStockCount?: number;
  leadsCount?: number;
  averageOrderValue?: number;
}

export default function StatsGrid({
  totalRevenue,
  ordersCount,
  productsCount,
  usersCount,
  lowStockCount = 0,
  leadsCount = 0,
  averageOrderValue,
}: StatsGridProps) {
  const router = useRouter();

  const calculatedAOV =
    averageOrderValue !== undefined
      ? averageOrderValue
      : ordersCount > 0
      ? Math.round(totalRevenue / ordersCount)
      : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
      {/* 1. Total Revenue */}
      <Card
        title="Total Revenue"
        value={`₹${totalRevenue.toLocaleString("en-IN")}`}
        subtitle={`AOV: ₹${calculatedAOV.toLocaleString("en-IN")} per order`}
        icon={IndianRupee}
        gradient="from-emerald-500/15 via-teal-500/5 to-transparent"
        iconColor="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        trend={{ value: "+18.4%", isPositive: true }}
        badge="Live"
        badgeColor="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
        onClick={() => router.push("/payments")}
      />

      {/* 2. Total Orders */}
      <Card
        title="Orders Placed"
        value={ordersCount.toLocaleString("en-IN")}
        subtitle="All-time customer checkouts"
        icon={ShoppingBag}
        gradient="from-blue-500/15 via-indigo-500/5 to-transparent"
        iconColor="text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20"
        trend={{ value: "+12.5%", isPositive: true }}
        onClick={() => router.push("/orders")}
      />

      {/* 3. Product Catalog & Stock Status */}
      <Card
        title="Active Products"
        value={productsCount.toLocaleString("en-IN")}
        subtitle={
          lowStockCount > 0
            ? `⚠️ ${lowStockCount} items low in stock`
            : "Warehouse stock healthy"
        }
        icon={Package}
        gradient="from-amber-500/15 via-yellow-500/5 to-transparent"
        iconColor="text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
        badge={lowStockCount > 0 ? `${lowStockCount} Alert` : "In Stock"}
        badgeColor={
          lowStockCount > 0
            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
        }
        onClick={() => router.push("/inventory")}
      />

      {/* 4. Total Customers & Registered Users */}
      <Card
        title="Registered Users"
        value={usersCount.toLocaleString("en-IN")}
        subtitle={
          leadsCount > 0
            ? `${leadsCount} CRM leads acquired`
            : "Verified customer base"
        }
        icon={Users}
        gradient="from-purple-500/15 via-fuchsia-500/5 to-transparent"
        iconColor="text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20"
        trend={{ value: "+8.7%", isPositive: true }}
        onClick={() => router.push("/users")}
      />
    </div>
  );
}
