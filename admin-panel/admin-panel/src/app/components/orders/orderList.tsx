"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, MoreHorizontal, Eye, Download } from "lucide-react";
import Pagination from "../Pagination";
import { TableSkeleton } from "../skeletonLoader/commonSkeleton";
import { adminTableWrapClass, adminTableWideClass, adminTableHeadCellClass, adminTableBodyCellClass } from "../ui/adminTable";
import { useRowActionMenu, rowActionDropdownClass } from "../ui/useRowActionMenu";

interface OrderListProps {
  orders: any[];
  loading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
}

export default function OrderList({ 
  orders, 
  loading, 
  total,
  totalPages,
  currentPage,
  searchTerm,
  onPageChange,
  onSearchChange,
  onUpdateStatus,
  onDelete,
  selectedIds = [],
  onSelectChange
}: OrderListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  useRowActionMenu(openMenuId, setOpenMenuId);

  const handleDelete = (id: string) => {
    setOpenMenuId(null);
    onDelete(id);
  };

  const handleDownloadInvoice = async (id: string) => {
    try {
      const token = localStorage.getItem("giftcartAdminToken") || "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/order/admin/${id}/invoice`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to generate invoice");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download invoice.");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectChange(orders.map(o => o._id));
    } else {
      onSelectChange([]);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const isAllSelected = orders.length > 0 && selectedIds.length === orders.length;

  return (
    <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden min-h-[600px]">
      <div className="p-4 sm:p-6 border-b border-border-theme flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card relative z-10">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search order ID or customer..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-background text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-background px-3 py-2 sm:px-4 sm:py-3 rounded-2xl border border-border-theme font-sans whitespace-nowrap">
          Total: {total}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : orders.length === 0 ? (
        <div className="p-20 text-center text-slate-400 italic">No orders found.</div>
      ) : (
        <div className={`${adminTableWrapClass} min-h-[450px]`}>
          <table className={adminTableWideClass}>
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
                <th className={adminTableHeadCellClass}>Order ID</th>
                <th className={adminTableHeadCellClass}>Customer</th>
                <th className={adminTableHeadCellClass}>Total Amount</th>
                <th className={adminTableHeadCellClass}>Payment</th>
                <th className={adminTableHeadCellClass}>Status</th>
                <th className={adminTableHeadCellClass}>WhatsApp</th>
                <th className={`${adminTableHeadCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-hover-theme transition-all duration-300 group border-b border-border-theme/50">
                  <td className={`${adminTableBodyCellClass} w-10 text-center pl-6`}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order._id)}
                      onChange={() => toggleSelect(order._id)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-5 w-[20%]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                        <ShoppingCart size={16} />
                      </div>
                      <span className="font-mono text-xs text-slate-400 uppercase font-bold tracking-widest">#{order._id.slice(-6)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 w-[20%] overflow-hidden">
                    <div className="font-bold text-slate-900 truncate">{order.user?.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                       <div className="text-xs text-slate-400 truncate flex-1">{order.user?.mobileNumber || "N/A"}</div>
                       {order.items?.[0]?.expectedDeliveryDate && (
                         <span className="text-[8px] whitespace-nowrap bg-primary/5 text-primary px-1.5 py-0.5 rounded font-black border border-primary/10">
                           {order.items[0].expectedDeliveryDate}
                         </span>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-5 w-[15%]">
                    <div className="flex flex-col gap-1">
                      <span className="bg-pink-50 text-pink-600 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap w-fit">
                        ₹{order.totalAmount}
                      </span>
                      {order.couponCode && (
                        <div className="flex items-center gap-1">
                           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 italic">
                             {order.couponCode}
                           </span>
                           <span className="text-[10px] font-bold text-slate-400">(-₹{order.discountAmount})</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 w-[15%]">
                    <span className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap ${
                      order.paymentMethod === 'COD' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {order.paymentMethod || 'Online'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order._id, e.target.value)}
                      className={`rounded-xl border-none px-3 py-2 text-[10px] font-bold focus:ring-0 cursor-pointer uppercase tracking-wider ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    {(() => {
                      const logs = Array.isArray(order.whatsappLogs) ? order.whatsappLogs : [];
                      if (logs.length === 0) {
                        return (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500">
                            —
                          </span>
                        );
                      }
                      const last = logs[logs.length - 1];
                      const ok = last?.success;
                      const skipped = last?.skipped;
                      const label = ok ? "Sent" : skipped ? "Skipped" : "Failed";
                      const cls = ok
                        ? "bg-emerald-50 text-emerald-700"
                        : skipped
                          ? "bg-slate-100 text-slate-600"
                          : "bg-red-50 text-red-700";
                      return (
                        <span
                          title={last?.to ? `To: ${last.to}` : undefined}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${cls}`}
                        >
                          {label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className={`${adminTableBodyCellClass} text-right`}>
                    <div className="relative inline-flex justify-end" data-row-action>
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === order._id ? null : order._id)}
                      className="p-2 text-slate-400 hover:text-slate-900 transition rounded-xl"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {openMenuId === order._id && (
                      <div className={rowActionDropdownClass}>
                        <Link
                          href={`/orders/${order._id}`}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-white bg-primary hover:opacity-90 rounded-xl transition"
                        >
                          <div className="p-1.5 bg-white/20 text-white rounded-lg">
                            <Eye size={16} />
                          </div>
                          View Details
                        </Link>
                        <div className="mx-2 my-1 border-t border-slate-100" />
                        <button
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                          onClick={() => handleDownloadInvoice(order._id)}
                        >
                          <Download size={16} className="text-slate-400" />
                          Download Invoice
                        </button>
                        <div className="mx-2 my-1 border-t border-slate-100" />
                        <button
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition"
                          onClick={() => handleDelete(order._id)}
                        >
                          Delete Order
                        </button>
                      </div>
                    )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
          {total === 0 ? "Showing 0 of 0" : `Showing ${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, total)} of ${total}`}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
