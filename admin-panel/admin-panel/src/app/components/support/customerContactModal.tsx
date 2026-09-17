"use client";

import React, { useState } from "react";
import { X, Send, User, Mail, Phone, ShoppingBag, FileText, Loader2, LifeBuoy } from "lucide-react";
import { createSupportTicket } from "../../services/supportService";
import { useToast } from "../../../context/ToastContext";

interface CustomerContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CustomerContactModal({
  isOpen,
  onClose,
  onSuccess,
}: CustomerContactModalProps) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    subject: "",
    orderId: "",
    message: "",
    priority: "medium",
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.mobileNumber || !form.subject || !form.message) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      await createSupportTicket(form);
      showToast("Support inquiry submitted successfully!", "success");
      setForm({
        name: "",
        email: "",
        mobileNumber: "",
        subject: "",
        orderId: "",
        message: "",
        priority: "medium",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.message || "Failed to submit inquiry", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-border-theme bg-card p-6 shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Customer Support Inquiry Form
            </h3>
            <p className="text-xs text-slate-500">
              Submit an issue or inquiry regarding orders, cakes, bouquets, or delivery.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-border-theme bg-background pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={form.mobileNumber}
                  onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-border-theme bg-background pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-border-theme bg-background pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Order ID (Optional)
              </label>
              <div className="relative">
                <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                  placeholder="e.g. GC-ORD-1002"
                  className="w-full rounded-xl border border-border-theme bg-background pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Subject / Topic <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Delivery delay inquiry / Change cake message"
                className="w-full rounded-xl border border-border-theme bg-background pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Issue Details / Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Please describe your issue or question in detail..."
              className="w-full rounded-xl border border-border-theme bg-background p-3 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border-theme bg-background px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-primary text-white px-5 py-2 text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>Submit Inquiry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
