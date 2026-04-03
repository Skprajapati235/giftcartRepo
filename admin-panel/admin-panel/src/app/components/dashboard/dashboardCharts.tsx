"use client";

import React from "react";
import {
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
  Legend
} from "recharts";

interface DashboardChartsProps {
  orders: any[];
}

// Dummy data for the monthly user orders graph as requested
const dummyMonthlyData = [
  { month: "Jan", orders: 120 },
  { month: "Feb", orders: 210 },
  { month: "Mar", orders: 150 },
  { month: "Apr", orders: 310 },
  { month: "May", orders: 280 },
  { month: "Jun", orders: 420 },
  { month: "Jul", orders: 380 },
];

const COLORS = ["#10b981", "#f59e0b", "#f43f5e"];

export default function DashboardCharts({ orders }: DashboardChartsProps) {
  // Real data for payment status distribution based on actual orders
  const capturedCount = orders.filter((o) => o.paymentStatus === "Captured" || o.paymentStatus === "Paid" || o.paymentStatus === "Success").length;
  const pendingCount = orders.filter((o) => o.paymentStatus === "Pending").length;
  const failedCount = orders.filter((o) => o.paymentStatus === "Failed" || o.status === "Cancelled").length;

  // Make sure to show something even if 0 orders so pie chart doesn't break
  const pieData = (capturedCount === 0 && pendingCount === 0 && failedCount === 0) ? [
    { name: "Captured", value: 1 },
    { name: "Pending", value: 0 },
    { name: "Failed", value: 0 },
  ] : [
    { name: "Captured", value: capturedCount },
    { name: "Pending", value: pendingCount },
    { name: "Failed", value: failedCount },
  ];

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-2">
      {/* Bar Chart Section */}
      <div className="bg-card shadow-lg border border-transparent dark:border-border-theme rounded-3xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Monthly Orders</h2>
          <p className="text-sm text-slate-500">Dummy representation of monthly user orders</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dummyMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: "bold" }}
                dy={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <RechartsTooltip
                cursor={{ fill: "var(--hover-bg)" }}
                contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              />
              <Bar
                dataKey="orders"
                fill="#3a85dd"
                radius={[6, 6, 6, 6]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart Section */}
      <div className="bg-card shadow-lg border border-transparent dark:border-border-theme rounded-3xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Payment Status</h2>
          <p className="text-sm text-slate-500">Real-time payment clearance distribution</p>
        </div>
        <div className="h-[300px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "14px", fontWeight: "bold", color: "var(--foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
