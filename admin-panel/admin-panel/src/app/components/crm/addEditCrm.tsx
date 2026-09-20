"use client";

import React, { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import * as service from "../../services/crmService";
import { useToast } from "../../../context/ToastContext";

interface AddEditCrmProps {
  contact?: any;
  onClose: () => void;
}

export default function AddEditCrm({ contact, onClose }: AddEditCrmProps) {
  const [formData, setFormData] = useState({
    name: contact?.name || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    company: contact?.company || "",
    role: contact?.role || "",
    source: contact?.source || "Website",
    type: contact?.type || "Customer",
    status: contact?.status || "Active",
    notes: contact?.notes || "",
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
      if (contact) {
        await service.updateCrmContact(contact._id, formData);
        showToast("CRM Contact updated successfully", "success");
      } else {
        await service.createCrmContact(formData);
        showToast("CRM Contact created successfully", "success");
      }
      onClose();
    } catch (error: any) {
      showToast(error.message || "Failed to save CRM contact", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border-theme bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          {contact ? "Edit CRM Contact" : "Add New CRM Contact"}
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
              placeholder="e.g. Jane Smith"
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
              placeholder="e.g. jane@company.com"
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
              placeholder="e.g. +91 9876543210"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 outline-none transition focus:border-primary"
              placeholder="e.g. Tech Corp"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 outline-none transition focus:border-primary"
              placeholder="e.g. Manager"
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
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="Website">Website</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Phone call">Phone call</option>
              <option value="Google">Google</option>
              <option value="Referral">Referral</option>
              <option value="Advertisement">Advertisement</option>
              <option value="Offline enquiry">Offline enquiry</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 outline-none transition focus:border-primary"
            >
              <option value="Customer">Customer</option>
              <option value="Partner">Partner</option>
              <option value="Supplier">Supplier</option>
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {contact ? "Update Contact" : "Save Contact"}
          </button>
        </div>
      </form>
    </div>
  );
}
