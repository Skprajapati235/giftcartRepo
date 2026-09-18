"use client";

import React, { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import * as service from "../../services/leadService";
import { useToast } from "../../../context/ToastContext";

interface AddEditLeadProps {
  lead?: any;
  onClose: () => void;
}

export default function AddEditLead({ lead, onClose }: AddEditLeadProps) {
  const [formData, setFormData] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    source: lead?.source || "website",
    status: lead?.status || "NEW",
    interestedProduct: lead?.interestedProduct || "",
    notes: lead?.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (lead) {
        await service.updateLead(lead._id, formData);
        showToast("Lead updated successfully", "success");
      } else {
        await service.createLead(formData);
        showToast("Lead created successfully", "success");
      }
      onClose();
    } catch (error: any) {
      showToast(error.message || "Failed to save lead", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border-theme bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          {lead ? "Edit Lead" : "Add New Lead"}
        </h2>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 transition hover:bg-hover-theme hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 outline-none transition focus:border-primary"
              placeholder="e.g. Rahul"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Phone</label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 outline-none transition focus:border-primary"
              placeholder="e.g. 98XXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 outline-none transition focus:border-primary"
              placeholder="e.g. rahul@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Interested Product</label>
            <input
              type="text"
              name="interestedProduct"
              value={formData.interestedProduct}
              onChange={handleChange}
              className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 outline-none transition focus:border-primary"
              placeholder="e.g. Chocolate Cake"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Source</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 outline-none transition focus:border-primary"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="website">Website</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone call</option>
              <option value="google">Google</option>
              <option value="referral">Referral</option>
              <option value="advertisement">Advertisement</option>
              <option value="offline">Offline enquiry</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 outline-none transition focus:border-primary"
            >
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="INTERESTED">Interested</option>
              <option value="OFFER_SENT">Offer Sent</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-semibold text-foreground">Notes</label>
            <textarea
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 outline-none transition focus:border-primary"
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border-theme pt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {lead ? "Update Lead" : "Save Lead"}
          </button>
        </div>
      </form>
    </div>
  );
}
