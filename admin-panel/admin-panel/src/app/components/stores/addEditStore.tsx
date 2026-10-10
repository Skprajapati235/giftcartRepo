"use client";

import React, { useState, useEffect } from "react";
import {
  Store,
  ArrowLeft,
  User,
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
  Percent,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  FileText,
  ShieldCheck,
  Save,
  Tag,
  X,
} from "lucide-react";
import * as service from "../../services/adminService";
import MediaModal from "../ui/MediaModal";
import { useToast } from "../../../context/ToastContext";

interface AddEditStoreProps {
  store: any; // null if adding, object if editing
  onClose: () => void;
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

export default function AddEditStore({ store, onClose }: AddEditStoreProps) {
  const isEditing = Boolean(store?._id);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    ownerFirstName: "",
    ownerLastName: "",
    ownerPhone: "",
    whatsappNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    googleMapsUrl: "",
    description: "",
    categories: [] as string[],
    commissionPercentage: 0,
    status: "active",
    notes: "",
  });

  const [customTagInput, setCustomTagInput] = useState("");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        image: store.image || "",
        ownerFirstName: store.ownerFirstName || "",
        ownerLastName: store.ownerLastName || "",
        ownerPhone: store.ownerPhone || "",
        whatsappNumber: store.whatsappNumber || store.ownerPhone || "",
        address: store.address || "",
        city: store.city || "",
        state: store.state || "",
        pincode: store.pincode || "",
        googleMapsUrl: store.googleMapsUrl || "",
        description: store.description || "",
        categories: Array.isArray(store.categories) ? store.categories : [],
        commissionPercentage: store.commissionPercentage ?? 0,
        status: store.status || "active",
        notes: store.notes || "",
      });
    }
  }, [store]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Auto-mirror ownerPhone to whatsappNumber if it was empty or matched ownerPhone
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
        showToast("New partner store created successfully!", "success");
      }
      onClose();
    } catch (err: any) {
      console.error("Error saving store:", err);
      showToast(err?.response?.data?.message || "Failed to save partner store", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. TOP HEADER STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <button
              type="button"
              onClick={onClose}
              className="hover:text-amber-500 transition-colors flex items-center gap-1 font-semibold"
            >
              <Store size={13} />
              <span>Partner Stores</span>
            </button>
            <span>/</span>
            <span className="text-foreground font-semibold">
              {isEditing ? `Edit: ${store?.name || "Store"}` : "Add New Tie-Up"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-2xl bg-surface border border-border-theme text-muted-foreground hover:text-foreground hover:bg-surface/80 transition-colors"
              title="Back to Stores List"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {isEditing ? `Edit Store: ${store?.name}` : "Add New Tie-Up Store"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Onboard local bakeries, florists and gift shops for instant WhatsApp order routing
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-border-theme text-foreground hover:bg-surface text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? "Saving Store..." : isEditing ? "Save Changes" : "Create Store"}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN FORM GRID */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Main Form Sections (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: Store Basics */}
          <div className="p-6 rounded-3xl bg-card border border-border-theme shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border-theme pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Store Identity & Brand</h3>
                  <p className="text-[11px] text-muted-foreground">Store name and fulfillment offerings</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Store / Bakery Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. The Belgian Bakehouse, Rose Bloom Florals"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Specializations / Categories */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Specializations / Supplied Items</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Select all that apply</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_CATEGORIES.map((cat) => {
                    const isSelected = formData.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                            : "bg-surface border-border-theme text-muted-foreground hover:border-amber-500/40"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {cat}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 items-center pt-1">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    placeholder="Add custom item category (press Enter)..."
                    className="flex-1 px-4 py-2 rounded-xl border border-border-theme bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-4 py-2 rounded-xl bg-surface border border-border-theme text-xs font-bold text-foreground hover:bg-surface/80"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Store Description & Capabilities
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Specializes in fresh 1kg truffle cakes, eggless varieties, midnight delivery dispatch within 30 mins..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Owner & WhatsApp Details */}
          <div className="p-6 rounded-3xl bg-card border border-border-theme shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border-theme pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Owner & WhatsApp Dispatch Channels</h3>
                  <p className="text-[11px] text-muted-foreground">Contacts for calling and sending order slips</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Owner First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerFirstName"
                  value={formData.ownerFirstName}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Owner Last Name</label>
                <input
                  type="text"
                  name="ownerLastName"
                  value={formData.ownerLastName}
                  onChange={handleChange}
                  placeholder="e.g. Gupta"
                  className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Calling Phone Number <span className="text-rose-500">*</span></span>
                  <Phone size={12} className="text-muted-foreground" />
                </label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Store WhatsApp Number <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                    <MessageCircle size={11} /> Auto dispatch slip
                  </span>
                </label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-500/30 bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Physical Address & Map */}
          <div className="p-6 rounded-3xl bg-card border border-border-theme shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border-theme pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Location & Pickup Address</h3>
                  <p className="text-[11px] text-muted-foreground">Store coordinates for riders and local delivery</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Street Address / Shop Details</label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Shop No. 14, Opposite Central Park, Hazratganj..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Lucknow"
                    className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Uttar Pradesh"
                    className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 226001"
                    className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Google Maps Location URL</span>
                  <span className="text-[11px] text-muted-foreground font-normal">For riders to navigate</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="googleMapsUrl"
                    value={formData.googleMapsUrl}
                    onChange={handleChange}
                    placeholder="https://maps.app.goo.gl/... or Google Maps share link"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <ExternalLink size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Commercial Agreement & Private Notes */}
          <div className="p-6 rounded-3xl bg-card border border-border-theme shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border-theme pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Commercial Agreement & Internal Notes</h3>
                  <p className="text-[11px] text-muted-foreground">Commission margin and private agreement terms</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Percent size={12} className="text-rose-500" /> Agreed Margin / Discount %
                </label>
                <input
                  type="number"
                  name="commissionPercentage"
                  min="0"
                  max="100"
                  value={formData.commissionPercentage}
                  onChange={handleChange}
                  placeholder="e.g. 20"
                  className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
                <p className="text-[11px] text-muted-foreground">
                  Your platform discount from their retail bill
                </p>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Admin Private Notes (Only visible to you)
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Agreement signed on 10 Oct, payment cycle every Monday, contact night manager Amit for midnight orders..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Media & Status Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Store Photo / Logo Card */}
          <div className="p-6 rounded-3xl bg-card border border-border-theme shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ImageIcon size={16} className="text-amber-500" /> Storefront Photo or Logo
            </h3>

            {/* Preview Box */}
            <div className="relative aspect-video rounded-2xl border-2 border-dashed border-border-theme bg-surface overflow-hidden flex flex-col items-center justify-center text-center p-4 group">
              {formData.image ? (
                <>
                  <img
                    src={formData.image}
                    alt="Store"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMediaModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                      className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-muted-foreground">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                    <Store size={24} />
                  </div>
                  <p className="text-xs font-medium">No photo uploaded yet</p>
                  <button
                    type="button"
                    onClick={() => setShowMediaModal(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1.5 mx-auto transition-colors"
                  >
                    <Upload size={13} /> Select from Media
                  </button>
                </div>
              )}
            </div>

            {/* Direct Image URL input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Or Direct Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          {/* Status & Operational Mode */}
          <div className="p-6 rounded-3xl bg-card border border-border-theme shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> Operational Status
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Partner State</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="active">🟢 Active (Ready for orders)</option>
                <option value="inactive">🔴 Inactive (Paused)</option>
                <option value="onboarding">🟡 Onboarding (In talks)</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border-theme text-xs space-y-2">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" /> Zero Return Model
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                When a customer orders a cake or bouquet in {formData.city || "this city"}, you ping this store on WhatsApp to bake & dispatch. No warehouse inventory required!
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? "Saving Store..." : isEditing ? "Save Changes" : "Save Tie-Up Store"}</span>
            </button>
          </div>
        </div>
      </form>

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
