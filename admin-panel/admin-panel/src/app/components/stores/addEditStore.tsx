"use client";

import React, { useState } from "react";
import {
  X,
  Upload,
  Store,
  User,
  Phone,
  MapPin,
  FileText,
  Percent,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import * as service from "../../services/adminService";
import MediaModal from "../ui/MediaModal";
import { useToast } from "../../../context/ToastContext";

interface AddEditStoreProps {
  store?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_CATEGORIES = [
  "Cakes & Pastries",
  "Fresh Flowers",
  "Chocolates & Hampers",
  "Personalized Gifts",
  "Party Balloons & Decor",
  "Plants & Greenery",
  "Baking Supplies",
];

export default function AddEditStore({ store, onClose, onSuccess }: AddEditStoreProps) {
  const isEditing = Boolean(store?._id);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: store?.name || "",
    image: store?.image || "",
    ownerFirstName: store?.ownerFirstName || "",
    ownerLastName: store?.ownerLastName || "",
    ownerPhone: store?.ownerPhone || "",
    whatsappNumber: store?.whatsappNumber || store?.ownerPhone || "",
    address: store?.address || "",
    city: store?.city || "",
    state: store?.state || "",
    pincode: store?.pincode || "",
    googleMapsUrl: store?.googleMapsUrl || "",
    description: store?.description || "",
    categories: Array.isArray(store?.categories) ? store.categories : [],
    commissionPercentage: store?.commissionPercentage ?? 0,
    status: store?.status || "active",
    notes: store?.notes || "",
  });

  const [customTagInput, setCustomTagInput] = useState("");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Auto-mirror ownerPhone to whatsappNumber if whatsappNumber was empty or identical
      ...(name === "ownerPhone" && (!prev.whatsappNumber || prev.whatsappNumber === prev.ownerPhone)
        ? { whatsappNumber: value }
        : {}),
    }));
  };

  const toggleCategory = (cat: string) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c: string) => c !== cat)
          : [...prev.categories, cat],
      };
    });
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const tag = customTagInput.trim();
    if (tag && !formData.categories.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, tag],
      }));
      setCustomTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Store name is required", "error");
      return;
    }
    if (!formData.ownerFirstName.trim()) {
      showToast("Owner first name is required", "error");
      return;
    }
    if (!formData.ownerPhone.trim()) {
      showToast("Owner phone number is required", "error");
      return;
    }
    if (!formData.whatsappNumber.trim()) {
      showToast("WhatsApp number is required", "error");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await service.updateStore(store._id, formData);
        showToast("Partner store updated successfully!", "success");
      } else {
        await service.createStore(formData);
        showToast("New partner store added successfully!", "success");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving store:", err);
      showToast(err?.response?.data?.message || "Failed to save partner store", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-3xl my-8 rounded-3xl border border-border-theme shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-theme bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Store size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isEditing ? "Edit Partner Store" : "Add New Partner Store (Tie-Up)"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Local bakeries, florists & fulfillment partners for instant order dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* SECTION 1: Store Basics & Branding */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Store size={14} /> 1. Store Identity & Logo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Store / Bakery Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. The Belgian Bakehouse, Rose Valley Florist"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Partner Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="active">🟢 Active (Ready for orders)</option>
                  <option value="inactive">🔴 Inactive (Paused)</option>
                  <option value="onboarding">🟡 Onboarding (In talks)</option>
                </select>
              </div>
            </div>

            {/* Store Image / Banner */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Storefront Photo or Logo</span>
                <span className="text-muted-foreground font-normal">URL or upload from gallery</span>
              </label>

              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://res.cloudinary.com/... or paste image link"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <ImageIcon size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
                </div>

                <button
                  type="button"
                  onClick={() => setShowMediaModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <Upload size={14} /> Pick from Media
                </button>
              </div>

              {/* Preview Thumbnail */}
              {formData.image && (
                <div className="mt-2 flex items-center gap-3 p-2.5 rounded-2xl bg-surface border border-border-theme">
                  <img
                    src={formData.image}
                    alt="Store Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-border-theme bg-background"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">Image Connected</p>
                    <p className="text-muted-foreground truncate max-w-md">{formData.image}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="border-border-theme" />

          {/* SECTION 2: Owner & Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-500 flex items-center gap-2">
              <User size={14} /> 2. Owner Information & Contact Channels
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Owner First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerFirstName"
                  value={formData.ownerFirstName}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Owner Last Name</label>
                <input
                  type="text"
                  name="ownerLastName"
                  value={formData.ownerLastName}
                  onChange={handleChange}
                  placeholder="e.g. Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>
                    Owner Calling Number <span className="text-rose-500">*</span>
                  </span>
                  <Phone size={12} className="text-muted-foreground" />
                </label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>
                    Store WhatsApp Number <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-normal">
                    <MessageCircle size={11} /> For instant order slips
                  </span>
                </label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>
          </div>

          <hr className="border-border-theme" />

          {/* SECTION 3: Location & Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
              <MapPin size={14} /> 3. Store Address & Delivery Zone
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Full Street Address</label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Shop No. 12, Ground Floor, Main Market..."
                className="w-full px-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Lucknow, Delhi"
                  className="w-full px-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Uttar Pradesh"
                  className="w-full px-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 226001"
                  className="w-full px-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Google Maps Location Link</span>
                <span className="text-muted-foreground font-normal">For riders to navigate</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="googleMapsUrl"
                  value={formData.googleMapsUrl}
                  onChange={handleChange}
                  placeholder="https://maps.app.goo.gl/... or Google Maps share link"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <ExternalLink size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
              </div>
            </div>
          </div>

          <hr className="border-border-theme" />

          {/* SECTION 4: Categories & Specializations */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-500 flex items-center gap-2">
              <CheckCircle2 size={14} /> 4. Items Supplied & Specializations
            </h3>

            <div className="flex flex-wrap gap-2">
              {COMMON_CATEGORIES.map((cat) => {
                const isSelected = formData.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-purple-500/15 border-purple-500 text-purple-500 shadow-sm"
                        : "bg-surface border-border-theme text-muted-foreground hover:border-purple-500/40"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag input */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                placeholder="Add other specialization (press Enter)..."
                className="flex-1 px-4 py-2 rounded-xl border border-border-theme bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-2 rounded-xl bg-surface border border-border-theme text-xs font-medium text-foreground hover:bg-surface/80"
              >
                Add Tag
              </button>
            </div>
          </div>

          <hr className="border-border-theme" />

          {/* SECTION 5: Description & Terms */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-500 flex items-center gap-2">
              <FileText size={14} /> 5. Commercial Agreement & Description
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Percent size={12} /> Agreed Commission / Discount %
                </label>
                <input
                  type="number"
                  name="commissionPercentage"
                  min="0"
                  max="100"
                  value={formData.commissionPercentage}
                  onChange={handleChange}
                  placeholder="e.g. 20"
                  className="w-full px-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
                <p className="text-[11px] text-muted-foreground">
                  e.g. 20% discount on their retail price
                </p>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Store Description & Capabilities
                </label>
                <textarea
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Specializes in fondant designer cakes, midnight rush delivery, 1kg red velvet..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Internal Private Notes (Only for You)
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Tie-up agreement date, payment settled weekly on Mondays, contact person at night..."
                className="w-full px-4 py-2.5 rounded-xl border border-border-theme bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-theme bg-surface/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border-theme text-foreground hover:bg-surface text-sm font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>Saving Partner Store...</>
            ) : (
              <>
                <Store size={16} />
                {isEditing ? "Update Partner Store" : "Save Partner Store"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Media Selector Modal */}
      {showMediaModal && (
        <MediaModal
          onClose={() => setShowMediaModal(false)}
          onSelect={(url) => {
            const singleUrl = Array.isArray(url) ? url[0] : url;
            setFormData((prev) => ({ ...prev, image: singleUrl }));
            setShowMediaModal(false);
          }}
        />
      )}
    </div>
  );
}
