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

const COLORS = ["#0f766e", "#f59e0b", "#3b82f6", "#16a34a", "#ef4444", "#64748b"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DashboardCharts({ orders }: DashboardChartsProps) {
  const statusData = [
    { name: "Pending", value: orders.filter((o) => o.status === "Pending").length },
    { name: "Processing", value: orders.filter((o) => o.status === "Processing").length },
    { name: "Shipped", value: orders.filter((o) => o.status === "Shipped").length },
    { name: "Delivered", value: orders.filter((o) => o.status === "Delivered").length },
    { name: "Cancelled", value: orders.filter((o) => o.status === "Cancelled").length },
  ];

  const pieData = statusData.filter((slice) => slice.value > 0);
  const displayedPieData = pieData.length > 0 ? pieData : [{ name: "No orders", value: 1 }];

  const monthMap = Array.from({ length: 6 }).reduce<Record<string, number>>((acc, _, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const monthName = MONTHS[date.getMonth()];
    return { ...acc, [monthName]: 0 };
  }, {});

  const monthlyData = orders.reduce((acc, order) => {
    const created = new Date(order.createdAt);
    const monthName = MONTHS[created.getMonth()];

    if (acc[monthName] !== undefined) {
      acc[monthName] += 1;
    }
    return acc;
  }, monthMap);

  const formattedMonthlyData = Object.entries(monthlyData).map(([month, value]) => ({ month, orders: value }));

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
            <BarChart data={formattedMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: "bold" }}
                dy={10}
              />
              <YAxis
                allowDecimals={false}
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
                data={displayedPieData}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {displayedPieData.map((entry, index) => (
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
