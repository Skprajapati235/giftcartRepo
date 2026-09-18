"use client";

import React from "react";
import Link from "next/link";
import { CreditCard, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

interface Payment {
  _id: string;
  razorpayPaymentId: string;
  totalAmount: number;
  createdAt: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
  sectionWrapper?: string;
}

export default function PaymentHistory({ payments, sectionWrapper = "" }: PaymentHistoryProps) {
  return (
    <section className={`rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm ${sectionWrapper}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Payment Gateway Settlements
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              Verified Razorpay gateway transactions
            </p>
          </div>
        </div>

        <Link
          href="/payments"
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
              <th className="pb-2 px-1.5">Razorpay ID</th>
              <th className="pb-2 px-1.5">Status</th>
              <th className="pb-2 px-1.5">Amount</th>
              <th className="pb-2 px-1.5 text-right">Processed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-theme/60">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-xs text-slate-500">
                  No payment settlements recorded yet
                </td>
              </tr>
            ) : (
              payments.slice(0, 5).map((pay) => (
                <tr
                  key={pay._id}
                  className="transition-colors hover:bg-hover-theme/50"
                >
                  {/* Payment ID Chip */}
                  <td className="py-2 px-1.5">
                    <div className="inline-flex items-center gap-1 rounded-md bg-background border border-border-theme px-2 py-0.5 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{pay.razorpayPaymentId || `PAY-${pay._id.slice(-6).toUpperCase()}`}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-2 px-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Captured
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-2 px-1.5">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                      ₹{pay.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-2 px-1.5 text-right">
                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(pay.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                    <div className="text-[9px] font-medium text-slate-500">
                      {new Date(pay.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
