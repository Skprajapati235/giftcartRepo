"use client";

import React from "react";

interface Payment {
  _id: string;
  razorpayPaymentId: string;
  totalAmount: number;
  createdAt: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
  sectionWrapper: string;
}

export default function PaymentHistory({ payments, sectionWrapper }: PaymentHistoryProps) {
  return (
    <section className={`rounded-3xl p-6 shadow-sm ${sectionWrapper}`}>
      <h3 className="mb-4 text-lg font-bold">Recent Payments</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="pb-3">Payment ID</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.slice(0, 5).map((pay) => (
              <tr key={pay._id} className="border-t border-border-theme/50 last:border-0 hover:bg-hover-theme/30 transition-colors">
                <td className="py-4 font-mono text-xs">{pay.razorpayPaymentId}</td>
                <td className="py-4 font-bold text-green-600">₹{pay.totalAmount}</td>
                <td className="py-4 text-slate-500">{new Date(pay.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
