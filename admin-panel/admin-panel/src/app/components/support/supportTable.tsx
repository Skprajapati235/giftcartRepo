"use client";

import React from "react";
import { SupportTicket } from "../../services/supportService";
import Pagination from "../Pagination";
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Phone,
  Mail,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface SupportTableProps {
  tickets: SupportTicket[];
  loading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  onPageChange: (page: number) => void;
  onViewTicket: (ticket: SupportTicket) => void;
  onDeleteTicket: (id: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
}

export default function SupportTable({
  tickets,
  loading,
  total,
  totalPages,
  currentPage,
  limit,
  onPageChange,
  onViewTicket,
  onDeleteTicket,
  selectedIds,
  onToggleSelect,
  onSelectAll,
}: SupportTableProps) {
  const allSelected = tickets.length > 0 && tickets.every((t) => selectedIds.includes(t._id));

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            High
          </span>
        );
      case "low":
        return (
          <span className="rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Low
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Medium
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold">
            <CheckCircle2 className="h-3 w-3" />
            Resolved
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 px-2.5 py-1 text-xs font-bold">
            <Clock className="h-3 w-3" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 text-xs font-bold">
            <AlertCircle className="h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-border-theme bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-theme bg-th-bg/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-border-theme text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4">Customer Details</th>
              <th className="py-3.5 px-4">Subject & Query</th>
              <th className="py-3.5 px-4">Order Ref</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Submitted</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-theme text-xs sm:text-sm">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4"><div className="h-3.5 w-48 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-8 w-20 ml-auto bg-slate-200 dark:bg-slate-800 rounded" /></td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
                    <LifeBuoy className="h-7 w-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">No support tickets found</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Customer inquiries submitted via website or app will appear here.
                  </p>
                </td>
              </tr>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedIds.includes(t._id);
                const initials = (t.name || "User")
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr
                    key={t._id}
                    className={`transition-colors hover:bg-hover-theme/60 ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(t._id)}
                        className="rounded border-border-theme text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                      />
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-xs">
                          {initials}
                        </div>
                        <div className="min-w-0 max-w-[200px]">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {t.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                            <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="truncate">{t.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                            <span>{t.mobileNumber}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Subject & Query */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {t.subject}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {t.message}
                      </p>
                      {t.adminReply && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Replied</span>
                        </div>
                      )}
                    </td>

                    {/* Order Reference */}
                    <td className="py-3.5 px-4">
                      {t.orderId ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-border-theme px-2 py-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          <ShoppingBag className="h-3 w-3 text-primary" />
                          {t.orderId}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">General Query</span>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">{getPriorityBadge(t.priority)}</td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(t.status)}</td>

                    {/* Submitted Date */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {new Date(t.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(t.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewTicket(t)}
                          className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                        >
                          View & Reply
                        </button>
                        <button
                          onClick={() => onDeleteTicket(t._id)}
                          title="Delete Ticket"
                          className="rounded-xl border border-border-theme bg-background p-1.5 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border-theme bg-card">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {total === 0 ? 0 : (currentPage - 1) * limit + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {Math.min(currentPage * limit, total)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-900 dark:text-white">{total}</span>{" "}
          support tickets
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
