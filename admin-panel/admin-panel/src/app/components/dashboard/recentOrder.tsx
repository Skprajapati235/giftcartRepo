"use client";

import React from "react";
import Link from "next/link";

interface Order {
  _id: string;
  user: { name: string; email: string; phone?: string };
  totalAmount: number;
}

interface RecentOrderProps {
  orders: Order[];
  sectionWrapper: string;
}

export default function RecentOrder({ orders, sectionWrapper }: RecentOrderProps) {
  return (
    <section className={`rounded-3xl p-6 shadow-sm ${sectionWrapper}`}>
      <h3 className="mb-4 text-lg font-bold">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="pb-3">Order ID</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Total</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map((order) => (
              <tr key={order._id} className="border-t border-border-theme/50 last:border-0 hover:bg-hover-theme/30 transition-colors">
                <td className="py-4 font-medium uppercase font-mono">{order._id.slice(-6)}</td>
                <td className="py-4">{order.user?.name}</td>
                <td className="py-4 font-semibold text-pink-600">₹{order.totalAmount}</td>
                <td className="py-4 text-right">
                  <Link
                    href={`/orders/${order._id}`}
                    className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-indigo-400"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
