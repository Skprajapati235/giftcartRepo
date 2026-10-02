"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, MoreHorizontal, Eye, Download, AlertTriangle, CheckCircle2, XCircle, Clock, Truck, ShieldAlert } from "lucide-react";
import Pagination from "../Pagination";
import { TableSkeleton } from "../skeletonLoader/commonSkeleton";
import { adminTableWrapClass, adminTableWideClass, adminTableHeadCellClass, adminTableBodyCellClass } from "../ui/adminTable";
import { useRowActionMenu, rowActionDropdownClass } from "../ui/useRowActionMenu";

export const isOrderPaymentIncomplete = (order: any): boolean => {
  if (!order) return false;
  if (order.paymentMethod === 'COD') return false;
  if (order.paymentStatus === 'Success') return false;
  if (order.isPaymentAbandoned) return true;
  if (order.paymentStatus === 'Incomplete' || order.paymentStatus === 'Cancelled') return true;
  // If order was created more than 15 minutes ago with Online method and still Pending, the customer exited/timed out
  if (order.paymentStatus === 'Pending' && order.createdAt) {
    const diffMins = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
    if (diffMins > 15) return true;
  }
  return false;
};

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

  const [filterTab, setFilterTab] = useState<'all' | 'paid' | 'cod' | 'incomplete'>('all');

  const incompleteCount = (orders || []).filter(isOrderPaymentIncomplete).length;
  const paidCount = (orders || []).filter(o => o.paymentStatus === 'Success').length;
  const codCount = (orders || []).filter(o => o.paymentMethod === 'COD').length;

  const displayedOrders = (orders || []).filter(order => {
    if (filterTab === 'paid') return order.paymentStatus === 'Success';
    if (filterTab === 'cod') return order.paymentMethod === 'COD';
    if (filterTab === 'incomplete') return isOrderPaymentIncomplete(order);
    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectChange(displayedOrders.map(o => o._id));
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

  const isAllSelected = displayedOrders.length > 0 && selectedIds.length === displayedOrders.length;

  return (
    <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden min-h-[600px]">
      <div className="p-4 sm:p-6 border-b border-border-theme flex flex-col gap-4 bg-card relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search order ID or customer..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-background text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {incompleteCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterTab('incomplete')}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors"
                title="Click to view all customers who backed out without paying"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span>{incompleteCount} User Backed Out</span>
              </button>
            )}
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-background px-3 py-2 sm:px-4 sm:py-3 rounded-2xl border border-border-theme font-sans whitespace-nowrap">
              Total: {total}
            </div>
          </div>
        </div>

        {/* Filter Quick-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filterTab === 'all'
                ? 'bg-primary text-white shadow-sm shadow-primary/25'
                : 'bg-background hover:bg-hover-theme text-slate-600 dark:text-slate-300 border border-border-theme'
            }`}
          >
            All Orders
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('incomplete')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filterTab === 'incomplete'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25'
                : incompleteCount > 0
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                : 'bg-background hover:bg-hover-theme text-slate-600 dark:text-slate-300 border border-border-theme'
            }`}
          >
            <AlertTriangle size={13} className={filterTab === 'incomplete' ? 'text-white' : 'text-rose-500'} />
            User Returned (Unpaid)
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              filterTab === 'incomplete'
                ? 'bg-white/20 text-white'
                : incompleteCount > 0
                ? 'bg-rose-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {incompleteCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('paid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filterTab === 'paid'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                : 'bg-background hover:bg-hover-theme text-slate-600 dark:text-slate-300 border border-border-theme'
            }`}
          >
            <CheckCircle2 size={13} className={filterTab === 'paid' ? 'text-white' : 'text-emerald-500'} />
            Paid (Online)
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterTab === 'paid' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {paidCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('cod')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filterTab === 'cod'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                : 'bg-background hover:bg-hover-theme text-slate-600 dark:text-slate-300 border border-border-theme'
            }`}
          >
            <Truck size={13} className={filterTab === 'cod' ? 'text-white' : 'text-indigo-500'} />
            COD
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterTab === 'cod' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {codCount}
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : displayedOrders.length === 0 ? (
        <div className="p-20 text-center text-slate-400 italic">
          {filterTab === 'incomplete' ? "No orders with user returned/incomplete payment found." : "No orders found."}
        </div>
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
                <th className={adminTableHeadCellClass}>Payment Info</th>
                <th className={adminTableHeadCellClass}>Status</th>
                <th className={adminTableHeadCellClass}>WhatsApp</th>
                <th className={`${adminTableHeadCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {displayedOrders.map((order) => {
                const isIncomplete = isOrderPaymentIncomplete(order);

                return (
                  <tr 
                    key={order._id} 
                    className={`transition-all duration-300 group border-b border-border-theme/50 ${
                      isIncomplete 
                        ? 'bg-rose-500/5 hover:bg-rose-500/10' 
                        : 'hover:bg-hover-theme'
                    }`}
                  >
                    <td className={`${adminTableBodyCellClass} w-10 text-center pl-6`}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order._id)}
                        onChange={() => toggleSelect(order._id)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5 w-[18%]">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          isIncomplete 
                            ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400' 
                            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                        }`}>
                          <ShoppingCart size={16} />
                        </div>
                        <div>
                          <span className="font-mono text-xs text-slate-500 uppercase font-bold tracking-widest">#{order._id.slice(-6)}</span>
                          {isIncomplete && (
                            <div className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">
                              Uncompleted
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 w-[18%] overflow-hidden">
                      <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{order.user?.name || "Customer"}</div>
                      <div className="flex items-center gap-2 mt-1">
                         <div className="text-xs text-slate-400 truncate flex-1">{order.user?.mobileNumber || "N/A"}</div>
                         {order.items?.[0]?.expectedDeliveryDate && (
                           <span className="text-[8px] whitespace-nowrap bg-primary/5 text-primary px-1.5 py-0.5 rounded font-black border border-primary/10">
                             {order.items[0].expectedDeliveryDate}
                           </span>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-5 w-[14%]">
                      <div className="flex flex-col gap-1">
                        <span className="bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-300 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap w-fit">
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
                    <td className="px-6 py-5 w-[20%]">
                      {(() => {
                        if (isIncomplete) {
                          return (
                            <div className="flex flex-col gap-1 items-start">
                              <span 
                                title={order.paymentCancelReason || "Customer returned or exited checkout without completing payment"}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-black text-[11px] bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 shadow-xs"
                              >
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                                User Backed Out (Unpaid)
                              </span>
                              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 pl-1 flex items-center gap-1">
                                <AlertTriangle size={11} className="shrink-0" />
                                Payment Incomplete
                              </span>
                            </div>
                          );
                        }

                        if (order.paymentStatus === 'Failed') {
                          return (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                <XCircle size={12} className="text-red-500" />
                                Payment Failed
                              </span>
                              <span className="text-[9px] text-slate-400 pl-1">
                                Gateway error / declined
                              </span>
                            </div>
                          );
                        }

                        if (order.paymentStatus === 'Success') {
                          return (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                                <CheckCircle2 size={12} className="text-emerald-600" />
                                Online • Paid
                              </span>
                              {order.razorpayPaymentId && (
                                <span className="text-[9px] font-mono text-slate-400 pl-1">
                                  #{order.razorpayPaymentId.slice(-8)}
                                </span>
                              )}
                            </div>
                          );
                        }

                        if (order.paymentMethod === 'COD') {
                          return (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/25">
                                <Truck size={12} className="text-green-600" />
                                Cash on Delivery
                              </span>
                            </div>
                          );
                        }

                        // Pending within 15 minutes
                        return (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 animate-pulse">
                              <Clock size={12} className="text-amber-600 animate-spin" />
                              Awaiting Payment...
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <select
                          value={order.status === 'Shipped' ? 'Shipping' : order.status === 'Preparing' ? 'In Kitchen' : order.status === 'OutForDelivery' ? 'Out for Delivery' : order.status}
                          onChange={(e) => onUpdateStatus(order._id, e.target.value)}
                          className={`rounded-xl border-none px-3 py-2 text-[10px] font-bold focus:ring-0 cursor-pointer uppercase tracking-wider ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            order.status === 'Packed' ? 'bg-purple-100 text-purple-700' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <option value="Received">Received</option>
                          <option value="Pending">Pending</option>
                          <option value="In Kitchen">In Kitchen</option>
                          <option value="Processing">Processing</option>
                          <option value="Packed">Packed</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Shipping">Shipping</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        {isIncomplete && (
                          <span className="text-[9px] font-bold text-rose-500/90 whitespace-nowrap pl-0.5">
                            Customer Backed Out
                          </span>
                        )}
                      </div>
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
              );
            })}
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
