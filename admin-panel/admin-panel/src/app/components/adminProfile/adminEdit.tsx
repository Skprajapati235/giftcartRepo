"use client";

import React, { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import { ShieldCheck, UserCheck, MapPin, Mail, User, Lock } from "lucide-react";
import { useToast } from "../../../context/ToastContext";

interface AdminEditFormProps {
  adminId: string;
  onCancel: () => void;
}

export default function AdminEditForm({ adminId, onCancel }: AdminEditFormProps) {
  const { admins, updateAdmin } = useAdmin();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    name: "",
    email: "",
    city: "",
    role: "admin",
  });

  useEffect(() => {
    const admin = admins.find((a) => a._id === adminId);
    if (admin) {
      setValues({
        name: admin.name || "",
        email: admin.email || "",
        city: admin.city || "",
        role: admin.role || "admin",
      });
    }
  }, [admins, adminId]);

  const saveEdit = async () => {
    setSaving(true);
    try {
      await updateAdmin(adminId, values);
      showToast("Staff profile updated successfully!", "success");
      onCancel();
    } catch (err: any) {
      showToast(err.message || "Failed to update admin profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 p-6 rounded-3xl bg-card border border-border-theme shadow-sm max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
          <UserCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground">Edit Staff Profile & Role</h2>
          <p className="text-xs text-slate-400">Update staff details and assign their workplace department.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={values.name}
              onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full Name"
              className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">Work Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={values.email}
              onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email address"
              className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">Assigned Role & RBAC Department</label>
          <div className="relative">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
            <select
              value={values.role}
              onChange={(e) => setValues((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground font-semibold outline-none focus:ring-2 focus:ring-pink-500/20"
            >
              <option value="super_admin">👑 Super Admin (Full Root Access)</option>
              <option value="kitchen_manager">👨‍🍳 Kitchen Manager (Baking Board, Flavors, Stock)</option>
              <option value="delivery_coordinator">🛵 Fleet Coordinator (Delivery Riders & Dispatch)</option>
              <option value="support_agent">🎧 Support Agent (Abandoned Carts, CRM & Inquiries)</option>
              <option value="seo_specialist">📈 SEO Specialist (Storefront Theme, Meta & Promos)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">City / Operating Hub</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={values.city}
              onChange={(e) => setValues((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="e.g. Faridabad Hub"
              className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={saveEdit}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-pink-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border-theme bg-background px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}