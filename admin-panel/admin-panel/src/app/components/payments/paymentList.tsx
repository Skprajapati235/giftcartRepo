"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Pagination from "../Pagination";
import { TableSkeleton } from "../skeletonLoader/commonSkeleton";

interface PaymentListProps {
  payments: any[];
  loading: boolean;
}

export default function PaymentList({ payments, loading }: PaymentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredPayments = useMemo(
    () => payments.filter((payment) =>
      payment.razorpayPaymentId?.toLowerCase().includes(normalizedSearch) ||
      payment.user?.name?.toLowerCase().includes(normalizedSearch) ||
      payment._id.toLowerCase().includes(normalizedSearch)
    ),
    [normalizedSearch, payments]
  );

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / 10));
  const pagePayments = filteredPayments.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden min-h-[400px]">
      <div className="p-6 border-b border-border-theme flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card relative z-10">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Payment ID or Customer..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-hover-theme text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : filteredPayments.length === 0 ? (
        <div className="p-20 text-center text-slate-400 italic">No exact matches found.</div>
      ) : (
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="bg-th-bg text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-border-theme">
                <th className="px-6 py-4 w-[25%] font-sans">Payment ID</th>
                <th className="px-6 py-4 w-[25%] font-sans">Customer</th>
                <th className="px-6 py-4 w-[20%] font-sans">Amount</th>
                <th className="px-6 py-4 w-[20%] font-sans">Date</th>
                <th className="px-6 py-4 w-[10%] font-sans">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {pagePayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-hover-theme transition-colors group border-b border-border-theme/50">
                  <td className="px-6 py-5 overflow-hidden">
                    <span className="font-mono text-xs text-foreground font-bold tracking-widest">{payment.razorpayPaymentId}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-foreground truncate">{payment.user?.name}</div>
                    <div className="text-xs text-slate-400 truncate">{payment.user?.email}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-hover-theme text-foreground/80 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap">
                      ₹{payment.totalAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm">
                    {new Date(payment.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-widest ${
                      payment.paymentStatus === 'Success' ? 'bg-green-500/10 text-green-600' :
                      payment.paymentStatus === 'Pending' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-red-500/10 text-red-600'
                    }`}>
                      {payment.paymentStatus || 'Success'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-6 border-t border-border-theme bg-card flex items-center justify-between">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
          Showing {(currentPage - 1) * 10 + Math.min(1, filteredPayments.length)}-{Math.min(currentPage * 10, filteredPayments.length)} of {filteredPayments.length}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
