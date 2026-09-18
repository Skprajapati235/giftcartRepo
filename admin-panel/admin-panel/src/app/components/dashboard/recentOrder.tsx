"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, CheckCircle2, Clock, Truck, Eye } from "lucide-react";

interface Order {
  _id: string;
  user: { name: string; email: string; phone?: string };
  totalAmount: number;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
}

interface RecentOrderProps {
  orders: Order[];
  sectionWrapper?: string;
}

export default function RecentOrder({ orders, sectionWrapper = "" }: RecentOrderProps) {
  const getStatusPill = (status?: string) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Delivered
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 dark:text-sky-400 border border-sky-500/20">
            <Truck className="h-3 w-3" />
            Shipped
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" />
            {status || "Pending"}
          </span>
        );
    }
  };

  return (
    <section className={`rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm ${sectionWrapper}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Recent Orders
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              Latest transactions placed by customers
            </p>
          </div>
        </div>

        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-secondary transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border-theme text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <th className="pb-2 px-1.5">Order ID</th>
              <th className="pb-2 px-1.5">Customer</th>
              <th className="pb-2 px-1.5">Status</th>
              <th className="pb-2 px-1.5">Total</th>
              <th className="pb-2 px-1.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-theme/60">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-xs text-slate-500">
                  No recent orders available
                </td>
              </tr>
            ) : (
              orders.slice(0, 5).map((order) => {
                const initials = (order.user?.name || "Customer")
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr
                    key={order._id}
                    className="transition-colors hover:bg-hover-theme/50"
                  >
                    {/* Order ID */}
                    <td className="py-2 px-1.5">
                      <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-2 px-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-black text-[9px]">
                          {initials}
                        </div>
                        <div className="min-w-0 max-w-[120px] sm:max-w-[160px]">
                          <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                            {order.user?.name || "Guest Customer"}
                          </div>
                          {order.createdAt && (
                            <div className="text-[9px] text-slate-600 dark:text-slate-400 font-medium">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2 px-1.5">
                      {getStatusPill(order.status)}
                    </td>

                    {/* Total Amount */}
                    <td className="py-2 px-1.5 text-xs font-black text-slate-900 dark:text-white">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </td>

                    {/* Action */}
                    <td className="py-2 px-1.5 text-right">
                      <Link
                        href={`/orders`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border-theme bg-background px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-primary hover:border-primary/40 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
