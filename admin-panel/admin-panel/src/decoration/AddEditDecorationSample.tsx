"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Building2,
  Tag,
  Save,
  CheckCircle2,
  Eye,
  Sparkles,
} from "lucide-react";
import * as service from "@/app/services/adminService";
import { useToast } from "@/context/ToastContext";

interface Props {
  sample: any | null; // null if adding new
  onClose: () => void;
}

const VENUE_TYPES = [
  "Hotel Room",
  "Home / Bedroom",
  "Cafe / Restaurant",
  "Terrace / Outdoor",
  "Banquet / Hall",
];

const OCCASIONS = [
  "Birthday",
  "Romantic Anniversary",
  "Proposal / Marry Me",
  "Candlelight Date",
  "Welcome Baby",
  "Bachelorette",
];

const FARIDABAD_HOTELS = [
  "Radisson Blu Faridabad (Mathura Road)",
  "Park Plaza Faridabad (Sector 21C)",
  "Vivanta Surajkund, NCR",
  "Courtyard by Marriott Aravali",
  "Goldfinch Hotel Surajkund",
  "Express Sarovar Portico Surajkund",
  "Private Apartment / Villa in NIT",
  "Private Bedroom in Sector 15 / 16",
  "Private Terrace in Greater Faridabad",
];

export default function AddEditDecorationSample({ sample, onClose }: Props) {
  const isEditing = Boolean(sample?._id);
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: sample?.title || "",
    venueType: sample?.venueType || "Hotel Room",
    hotelOrLocation: sample?.hotelOrLocation || "",
    city: sample?.city || "Faridabad",
    occasion: sample?.occasion || "Romantic Anniversary",
    imageUrl: sample?.imageUrl || "",
    beforeImageUrl: sample?.beforeImageUrl || "",
    caption: sample?.caption || "",
    tags: (sample?.tags || ["Rose Petals", "LED Candles", "Fairy Lights"]).join(", "),
    showOnStorefront: sample?.showOnStorefront !== false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      showToast("Title and Image URL are required", "error");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
      };

      if (isEditing) {
        await service.updateDecorationSample(sample._id, payload);
        showToast("Showcase sample updated successfully!", "success");
      } else {
        await service.createDecorationSample(payload);
        showToast("New real setup sample published to showcase!", "success");
      }
      onClose();
    } catch (err: any) {
      showToast(err.message || "Failed to save sample", "error");
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
              <span className="text-xl">📸</span>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {isEditing ? "Edit Real Setup Sample" : "Add Real Setup Showcase Sample"}
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Upload real photos from Faridabad hotel rooms & party venues so customers can see actual setups.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700">
            <input
              type="checkbox"
              checked={formData.showOnStorefront}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, showOnStorefront: e.target.checked }))
              }
              className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
            />
            <span>Show on Website & App Showcase</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sample Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
            Showcase Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Radisson Blu Faridabad Heart Bed & Candlelight Setup"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Venue Type & Occasion & City */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Venue Type
            </label>
            <select
              value={formData.venueType}
              onChange={(e) => setFormData((prev) => ({ ...prev, venueType: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {VENUE_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Occasion
            </label>
            <select
              value={formData.occasion}
              onChange={(e) => setFormData((prev) => ({ ...prev, occasion: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {OCCASIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Hotel / Venue Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center justify-between">
            <span>Hotel / Specific Location Name</span>
            <span className="text-[10px] text-pink-600 lowercase font-bold">Quick suggestions below</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Radisson Blu Faridabad, Room 402 or Sector 15 Residence"
            value={formData.hotelOrLocation}
            onChange={(e) => setFormData((prev) => ({ ...prev, hotelOrLocation: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          {/* Quick suggestions pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {FARIDABAD_HOTELS.map((hotel) => (
              <button
                key={hotel}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, hotelOrLocation: hotel }))}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-pink-100 dark:hover:bg-pink-950/40 text-gray-700 dark:text-gray-300 hover:text-pink-600 transition font-medium"
              >
                + {hotel}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Completed Setup Image URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/... or uploaded CDN URL"
              value={formData.imageUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            {formData.imageUrl && (
              <div className="mt-2 w-full h-36 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 relative bg-black/5">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => ((e.target as any).src = "https://placehold.co/600x400?text=Invalid+Image")}
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                  Final Setup Preview
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Optional "Before" Image URL (Empty Room)
            </label>
            <input
              type="url"
              placeholder="Before photo to show the room transformation"
              value={formData.beforeImageUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, beforeImageUrl: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            {formData.beforeImageUrl && (
              <div className="mt-2 w-full h-36 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 relative bg-black/5">
                <img
                  src={formData.beforeImageUrl}
                  alt="Before Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => ((e.target as any).src = "https://placehold.co/600x400?text=Invalid+Image")}
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                  Before Setup Preview
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Caption */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
            Customer-Facing Setup Caption
          </label>
          <textarea
            rows={2}
            placeholder="e.g., 200 metallic balloons, fresh Dutch rose bed heart, and romantic warm fairy lights in suite room."
            value={formData.caption}
            onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
            Tags (comma separated)
          </label>
          <input
            type="text"
            placeholder="Rose Petals, LED Candles, Hotel Room, Fairy Lights, Balloons"
            value={formData.tags}
            onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
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
            <span>{saving ? "Publishing..." : isEditing ? "Save Changes" : "Publish to Showcase"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
