"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Pagination from "../Pagination";
import { TableSkeleton } from "../skeletonLoader/commonSkeleton";
import { adminTableWrapClass, adminTableClass, adminTableHeadCellClass, adminTableBodyCellClass } from "../ui/adminTable";
import PaymentDetailDialog from "./paymentDetailDialog";

interface PaymentListProps {
  payments: any[];
  loading: boolean;
  onDelete?: (id: string) => void;
  selectedIds?: string[];
  onSelectChange?: (ids: string[]) => void;
}

export default function PaymentList({ payments, loading, onDelete, selectedIds = [], onSelectChange }: PaymentListProps) {
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectChange) return;
    if (e.target.checked) {
      onSelectChange(payments.map(p => p._id));
    } else {
      onSelectChange([]);
    }
  };

  const toggleSelect = (id: string) => {
    if (!onSelectChange) return;
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const isAllSelected = payments.length > 0 && selectedIds.length === payments.length;

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
        <div className={`${adminTableWrapClass} min-h-[400px]`}>
          <table className={adminTableClass}>
            <thead>
              <tr className="bg-th-bg border-b border-border-theme">
                <th className={`${adminTableHeadCellClass} w-10 text-center pl-6`}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer"
                  />
                </th>
                <th className={adminTableHeadCellClass}>Payment ID</th>
                <th className={adminTableHeadCellClass}>Customer</th>
                <th className={adminTableHeadCellClass}>Amount</th>
                <th className={adminTableHeadCellClass}>Date</th>
                <th className={adminTableHeadCellClass}>Status</th>
                <th className={`${adminTableHeadCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {pagePayments.map((payment) => (
                <tr key={payment._id} onClick={() => setSelectedPayment(payment)} className="hover:bg-hover-theme transition-colors group border-b border-border-theme/50 cursor-pointer">
                  <td className={`${adminTableBodyCellClass} w-10 text-center pl-6`} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(payment._id)}
                      onChange={() => toggleSelect(payment._id)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-5 overflow-hidden flex items-center gap-3">
                    <span className={`w-2 h-8 rounded-full ${payment.paymentStatus === 'Success' ? 'bg-emerald-400' : payment.paymentStatus === 'Processing' ? 'bg-amber-400' : payment.paymentStatus === 'Pending' ? 'bg-blue-400' : 'bg-red-400'}`} />
                    <span className="font-mono text-xs text-foreground font-bold tracking-widest">{payment.razorpayPaymentId}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-foreground truncate">{payment.user?.name}</div>
                    <div className="text-xs text-slate-400 truncate">{payment.user?.mobileNumber || "N/A"}</div>
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
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${payment.paymentStatus === 'Success' ? 'bg-emerald-400' : payment.paymentStatus === 'Processing' ? 'bg-amber-400' : payment.paymentStatus === 'Pending' ? 'bg-blue-400' : 'bg-red-400'}`} />
                      <span className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest ${payment.paymentStatus === 'Success' ? 'bg-emerald-500/10 text-emerald-400' :
                          payment.paymentStatus === 'Processing' ? 'bg-amber-500/10 text-amber-400' :
                            payment.paymentStatus === 'Pending' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-red-500/10 text-red-400'
                        }`}>{payment.paymentStatus || 'Success'}</span>
                    </div>
                  </td>
                  <td className={`${adminTableBodyCellClass} text-right`}>
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(payment._id);
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                        title="Delete Payment"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-6 border-t border-border-theme bg-card flex items-center justify-between">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
          {filteredPayments.length === 0 ? "Showing 0 of 0" : `Showing ${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, filteredPayments.length)} of ${filteredPayments.length}`}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
      {selectedPayment ? (
        <PaymentDetailDialog payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
      ) : null}
    </div>
  );
}

