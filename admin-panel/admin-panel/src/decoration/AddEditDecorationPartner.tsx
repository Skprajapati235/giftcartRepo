"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Store,
  Phone,
  MessageCircle,
  MapPin,
  Percent,
  CheckCircle2,
  Save,
  Tag,
  Star,
} from "lucide-react";
import * as service from "@/app/services/adminService";
import { useToast } from "@/context/ToastContext";

interface Props {
  partner: any | null; // null if adding new
  onClose: () => void;
}

const FARIDABAD_AREAS = [
  "NIT Faridabad (1, 2, 3, 4, 5)",
  "Sector 15 & 16",
  "Sector 21 & Surajkund",
  "Greater Faridabad (Neharpar)",
  "Sector 14 & Mathura Road",
  "Charmwood Village & Green Field",
  "Sector 28, 29, 31",
  "Badkal Lake & Neelam Bata",
];

export default function AddEditDecorationPartner({ partner, onClose }: Props) {
  const isEditing = Boolean(partner?._id);
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: partner?.name || "",
    ownerName: partner?.ownerName || "",
    phone: partner?.phone || "",
    whatsapp: partner?.whatsapp || "",
    city: partner?.city || "Faridabad",
    coveredAreas: partner?.coveredAreas || ["NIT Faridabad (1, 2, 3, 4, 5)", "Sector 15 & 16"],
    address: partner?.address || "",
    commissionPercentage: partner?.commissionPercentage || 20,
    status: partner?.status || "active",
    notes: partner?.notes || "",
  });

  const toggleArea = (area: string) => {
    setFormData((prev) => {
      const exists = prev.coveredAreas.includes(area);
      return {
        ...prev,
        coveredAreas: exists
          ? prev.coveredAreas.filter((a: string) => a !== area)
          : [...prev.coveredAreas, area],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.ownerName.trim() ||
      !formData.phone.trim() ||
      !formData.whatsapp.trim()
    ) {
      showToast("Please fill in firm name, owner name, calling phone, and WhatsApp.", "error");
      return;
    }

    try {
      setSaving(true);
      if (isEditing) {
        await service.updateDecoratorPartner(partner._id, formData);
        showToast("Decorator partner updated successfully!", "success");
      } else {
        await service.createDecoratorPartner(formData);
        showToast("New Faridabad decorator partner onboarded!", "success");
      }
      onClose();
    } catch (err: any) {
      showToast(err.message || "Failed to save decorator partner", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-xl space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤝</span>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {isEditing ? "Edit Faridabad Decorator Partner" : "Onboard New Faridabad Decorator Partner"}
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Tie-up local balloon decorators, flower vendors, and room setup artists for automated dispatch.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 text-xs font-black">
          Pilot City: Faridabad
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Firm Name & Owner Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Decorator Firm / Store Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., NIT Balloon Art & Events"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Owner / Lead Decorator Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Amit Sharma"
              value={formData.ownerName}
              onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Calling Phone & WhatsApp Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Calling Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="10-digit calling number"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
              WhatsApp Number (For Work Order Slip) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="10-digit WhatsApp number"
                value={formData.whatsapp}
                onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Commission % & Status & City */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Platform Cut (%)
            </label>
            <div className="relative">
              <Percent className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="0"
                max="100"
                value={formData.commissionPercentage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    commissionPercentage: Number(e.target.value),
                  }))
                }
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Partner Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="active">Active (Available for setups)</option>
              <option value="inactive">Paused (Unavailable)</option>
              <option value="onboarding">Onboarding Verification</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Hub City
            </label>
            <input
              type="text"
              disabled
              value={formData.city}
              className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Covered Sectors in Faridabad */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
            Covered Faridabad Sectors & Localities
          </label>
          <div className="flex flex-wrap gap-2">
            {FARIDABAD_AREAS.map((area) => {
              const active = formData.coveredAreas.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    active
                      ? "bg-pink-600 text-white border-pink-600 shadow-sm"
                      : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-pink-300"
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{area}</span>
                  {active && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
            Physical Store / Workshop Address in Faridabad
          </label>
          <input
            type="text"
            placeholder="e.g., Shop 12, Main Market, NIT-1, Faridabad"
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Internal Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
            Private Admin Notes (Team members, specialization, etc.)
          </label>
          <textarea
            rows={2}
            placeholder="e.g., Specializes in metallic chrome balloons and 4-hour quick setups."
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-pink-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : isEditing ? "Save Changes" : "Onboard Partner"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
