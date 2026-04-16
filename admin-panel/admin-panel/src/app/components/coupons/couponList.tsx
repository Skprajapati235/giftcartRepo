"use client";

import React from "react";
import { Search, Edit2, Trash2, Tag, Calendar, ShieldCheck, ShieldAlert, Percent, IndianRupee } from "lucide-react";
import { TableSkeleton } from "../skeletonLoader/commonSkeleton";
import Pagination from "../Pagination";

interface CouponListProps {
  coupons: any[];
  loading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onEdit: (coupon: any) => void;
  onDelete: (id: string) => void;
}

export default function CouponList({ 
  coupons, 
  loading, 
  total,
  totalPages,
  currentPage,
  searchTerm,
  onPageChange,
  onSearchChange,
  onEdit, 
  onDelete 
}: CouponListProps) {
  if (loading) {
    return <TableSkeleton rows={8} cols={6} />;
  }

  return (
    <div className="bg-card rounded-3xl border border-border-theme overflow-hidden shadow-sm min-h-[500px]">
      <div className="p-6 border-b border-border-theme flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card relative z-10">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search coupon code..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-background px-4 py-3 rounded-2xl border border-border-theme font-sans">
          Total Coupons: {total}
        </div>
      </div>

      {coupons.length === 0 ? (
        <div className="p-20 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Tag className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold">No coupons found</h3>
          <p className="text-slate-500 mt-1">Try a different search or create a new coupon.</p>
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left table-fixed border-collapse">
          <thead>
            <tr className="bg-th-bg text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-border-theme">
              <th className="px-6 py-4 w-[25%] font-sans">Coupon Code</th>
              <th className="px-6 py-4 w-[15%] font-sans">Discount</th>
              <th className="px-6 py-4 w-[20%] font-sans">Conditions</th>
              <th className="px-6 py-4 w-[15%] font-sans font-sans">Usage Stat</th>
              <th className="px-6 py-4 w-[10%] font-sans">Expiry</th>
              <th className="px-6 py-4 w-[15%] font-sans">Status</th>
              <th className="px-8 py-4 w-[10%] text-right font-sans">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-theme">
            {coupons.map((coupon) => {
              const isExpired = new Date(coupon.expiryDate) < new Date();
              return (
                <tr key={coupon._id} className="hover:bg-hover-theme transition-all duration-300 group border-b border-border-theme/50">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase overflow-hidden shrink-0 border border-border-theme">
                        {coupon.image ? (
                          <img src={coupon.image} className="w-full h-full object-cover" />
                        ) : (
                          coupon.code.substring(0, 2)
                        )}
                      </div>
                      <span className="font-bold text-slate-900 tracking-tight trancate">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-black text-pink-600 text-sm whitespace-nowrap">
                        {coupon.discountType === "percentage" ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{coupon.discountType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">Min Order: ₹{coupon.minOrderAmount}</p>
                      {coupon.maxDiscount > 0 && <p className="text-[10px] text-slate-400 font-bold">Max Cap: ₹{coupon.maxDiscount}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center pr-2">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{coupon.usedCount}/{coupon.usageLimit}</span>
                         <span className="text-[10px] font-bold text-slate-500">{Math.round((coupon.usedCount / coupon.usageLimit) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-500">
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    {coupon.isActive && !isExpired ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                        <ShieldCheck size={12} /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider">
                        <ShieldAlert size={12} /> {isExpired ? "Expired" : "Deactive"}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(coupon)}
                        className="p-2.5 bg-background border border-border-theme text-slate-400 rounded-xl hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(coupon._id)}
                        className="p-2.5 bg-background border border-border-theme text-slate-400 rounded-xl hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-sm"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      <div className="p-6 border-t border-border-theme bg-card flex items-center justify-between font-sans">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing {(currentPage - 1) * 10 + Math.min(1, coupons.length)}-{Math.min(currentPage * 10, total)} of {total}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
