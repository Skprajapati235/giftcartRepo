"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Phone,
  ShoppingBag,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Calendar,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { SupportTicket } from "../../services/supportService";

interface SupportDetailModalProps {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, priority?: string) => Promise<void>;
  onSendReply: (id: string, reply: string, markResolved: boolean) => Promise<void>;
}

export default function SupportDetailModal({
  ticket,
  isOpen,
  onClose,
  onUpdateStatus,
  onSendReply,
}: SupportDetailModalProps) {
  if (!isOpen || !ticket) return null;

  const [status, setStatus] = useState<string>(ticket.status);
  const [priority, setPriority] = useState<string>(ticket.priority);
  const [adminReply, setAdminReply] = useState<string>(ticket.adminReply || "");
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  useEffect(() => {
    setStatus(ticket.status);
    setPriority(ticket.priority);
    setAdminReply(ticket.adminReply || "");
  }, [ticket]);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(ticket._id, newStatus, priority);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setPriority(newPriority);
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(ticket._id, status, newPriority);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim()) return;

    setIsSubmittingReply(true);
    try {
      await onSendReply(ticket._id, adminReply.trim(), true);
      setStatus("resolved");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-border-theme bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-theme bg-hover-theme/40">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-sm">
              {(ticket.name || "U").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Support Ticket Details
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {ticket.subject}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer Profile & Info Card */}
          <div className="grid gap-3 sm:grid-cols-2 rounded-2xl border border-border-theme bg-background p-4">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Customer
              </span>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                {ticket.name}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <a
                  href={`mailto:${ticket.email}`}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Mail className="h-3 w-3" />
                  {ticket.email}
                </a>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <a
                  href={`tel:${ticket.mobileNumber}`}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:underline"
                >
                  <Phone className="h-3 w-3" />
                  {ticket.mobileNumber}
                </a>
              </div>
            </div>

            <div className="sm:border-l sm:border-border-theme sm:pl-4">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Ticket Information
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>
                  {new Date(ticket.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {ticket.orderId ? (
                <div className="mt-2">
                  <span className="text-[11px] text-slate-400 block">Linked Order:</span>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-mono font-bold text-primary mt-0.5">
                    <ShoppingBag className="h-3 w-3" />
                    <span>{ticket.orderId}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-slate-400 italic">No order linked</div>
              )}
            </div>
          </div>

          {/* Status & Priority Controls */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border-theme bg-card p-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Ticket Status:
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className="w-full rounded-xl border border-border-theme bg-background px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              >
                <option value="pending">⏳ Pending Response</option>
                <option value="in_progress">⚙️ In Progress</option>
                <option value="resolved">✅ Resolved</option>
                <option value="closed">🔒 Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Priority:
              </label>
              <select
                value={priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                disabled={isUpdatingStatus}
                className="w-full rounded-xl border border-border-theme bg-background px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Customer's Query / Message */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Customer Message:
            </label>
            <div className="rounded-2xl border border-border-theme bg-background p-4 text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
              {ticket.message}
            </div>
          </div>

          {/* Existing Admin Reply (if already replied) */}
          {ticket.adminReply && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Recorded Admin Reply:
                </label>
                {ticket.repliedAt && (
                  <span className="text-[11px] text-slate-400">
                    {new Date(ticket.repliedAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {ticket.adminReply}
              </div>
            </div>
          )}

          {/* Admin Reply Form */}
          <form onSubmit={handleReplySubmit} className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {ticket.adminReply ? "Update Reply Message:" : "Write Admin Reply & Resolution:"}
            </label>
            <textarea
              rows={3}
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
              placeholder="Type your response to the customer..."
              className="w-full rounded-2xl border border-border-theme bg-background p-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={isSubmittingReply || !adminReply.trim()}
                className="flex items-center gap-2 rounded-xl bg-primary text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingReply ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Send & Mark Resolved</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
