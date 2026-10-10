"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  MapPin,
  Save,
  Tag,
  DollarSign,
  Palette,
  Globe,
  Search,
} from "lucide-react";
import * as service from "@/app/services/adminService";
import MediaModal from "@/app/components/ui/MediaModal";
import { useToast } from "@/context/ToastContext";

interface AddEditDecorationPackageProps {
  pkg: any; // null if adding, object if editing
  onClose: () => void;
}

const CATEGORIES = [
  "Hotel Room Decor",
  "Birthday Party Setup",
  "Romantic Anniversary",
  "Canopy & Cabana",
  "Marry Me / Proposal",
  "Baby Shower & Welcome",
  "Car Boot Surprise",
];

export default function AddEditDecorationPackage({
  pkg,
  onClose,
}: AddEditDecorationPackageProps) {
  const isEditing = Boolean(pkg?._id);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    price: "",
    salePrice: "",
    category: "Hotel Room Decor",
    coverImage: "",
    images: [] as string[],
    summary: "",
    description: "",
    inclusions: [] as string[],
    estimatedSetupTime: "1.5 to 2 hours",
    colorThemes: ["Red & Gold", "Rose Gold & White", "Blue & Silver", "Black & Gold"],
    availableCities: ["Faridabad"] as string[],
    isActive: true,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  const [inclusionInput, setInclusionInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"cover" | "gallery">("cover");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pkg) {
      setFormData({
        title: pkg.title || "",
        slug: pkg.slug || "",
        price: pkg.price?.toString() || "",
        salePrice: pkg.salePrice?.toString() || "",
        category: pkg.category || "Hotel Room Decor",
        coverImage: pkg.coverImage || (pkg.images && pkg.images[0]) || "",
        images: Array.isArray(pkg.images) ? pkg.images : [],
        summary: pkg.summary || "",
        description: pkg.description || "",
        inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
        estimatedSetupTime: pkg.estimatedSetupTime || "1.5 to 2 hours",
        colorThemes:
          Array.isArray(pkg.colorThemes) && pkg.colorThemes.length
            ? pkg.colorThemes
            : ["Red & Gold"],
        availableCities:
          Array.isArray(pkg.availableCities) && pkg.availableCities.length
            ? pkg.availableCities
            : ["Faridabad"],
        isActive: pkg.isActive ?? true,
        seoTitle: pkg.seoTitle || "",
        seoDescription: pkg.seoDescription || "",
        seoKeywords: Array.isArray(pkg.seoKeywords)
          ? pkg.seoKeywords.join(", ")
          : pkg.seoKeywords || "",
      });
    }
  }, [pkg]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "title" && !prev.slug
        ? {
            slug: value
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, ""),
          }
        : {}),
    }));
  };

  const handleAddInclusion = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const item = inclusionInput.trim();
    if (item && !formData.inclusions.includes(item)) {
      setFormData((prev) => ({ ...prev, inclusions: [...prev.inclusions, item] }));
      setInclusionInput("");
    }
  };

  const handleRemoveInclusion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index),
    }));
  };

  const handleAddCity = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const city = cityInput.trim();
    if (city && !formData.availableCities.includes(city)) {
      setFormData((prev) => ({ ...prev, availableCities: [...prev.availableCities, city] }));
      setCityInput("");
    }
  };

  const handleRemoveCity = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      availableCities: prev.availableCities.filter((c) => c !== city),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast("Package title is required", "error");
      return;
    }
    if (!formData.price) {
      showToast("Price is required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        seoKeywords:
          typeof formData.seoKeywords === "string"
            ? formData.seoKeywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
            : formData.seoKeywords,
      };

      if (isEditing) {
        await service.updateDecorationPackage(pkg._id, payload);
        showToast("Decoration package updated successfully!", "success");
      } else {
        await service.createDecorationPackage(payload);
        showToast("New decoration package created successfully!", "success");
      }
      onClose();
    } catch (err: any) {
      console.error("Error saving package:", err);
      showToast(err?.response?.data?.message || "Failed to save decoration package", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <button
              type="button"
              onClick={onClose}
              className="hover:text-pink-500 transition-colors flex items-center gap-1 font-semibold"
            >
              <Sparkles size={13} />
              <span>Faridabad Decoration Studio</span>
            </button>
            <span>/</span>
            <span className="text-foreground font-semibold">
              {isEditing ? `Edit: ${pkg?.title}` : "New Decoration Package"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-2xl bg-surface border border-border-theme text-muted-foreground hover:text-foreground hover:bg-surface/80 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {isEditing ? `Edit Package: ${pkg?.title}` : "Add New Decoration Package"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Faridabad hotel room, party venue & surprise setup package configurations
              </p>
            </div>
          </div>
        </div>

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
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold shadow-lg shadow-pink-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>
              {saving ? "Saving Package..." : isEditing ? "Save Changes" : "Create Package"}
            </span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Inclusions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Package Basics */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles size={16} className="text-pink-500" /> Package Identity & Pricing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Package Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Faridabad Romantic Rose Petals Hotel Room Decor"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  URL Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="romantic-hotel-decor"
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  List MRP Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="3999"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Offer / Sale Price (₹)
                </label>
                <input
                  type="number"
                  name="salePrice"
                  min="0"
                  value={formData.salePrice}
                  onChange={handleChange}
                  placeholder="2499"
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-sm font-bold text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Clock size={13} className="text-muted-foreground" /> Estimated Setup Time
                </label>
                <input
                  type="text"
                  name="estimatedSetupTime"
                  value={formData.estimatedSetupTime}
                  onChange={handleChange}
                  placeholder="1.5 to 2 hours"
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Active Status</label>
                <select
                  name="isActive"
                  value={formData.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.value === "true" }))
                  }
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                >
                  <option value="true">🟢 Active (Visible to Customers)</option>
                  <option value="false">🔴 Paused / Hidden</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-foreground">Short Summary (Preview)</label>
              <textarea
                name="summary"
                rows={2}
                value={formData.summary}
                onChange={handleChange}
                placeholder="100 metallic balloons, fresh rose petals heart on bed, warm fairy lights, and LED candles."
                className="w-full px-4 py-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/30 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Full Description</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Comprehensive description of setup, inclusions, and hotel room permissions..."
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/30"
              />
            </div>
          </div>

          {/* Section 2: Inclusions List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Package Inclusions (What is Provided)
              </span>
              <span className="text-xs text-muted-foreground font-normal">
                {formData.inclusions.length} items added
              </span>
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={inclusionInput}
                onChange={(e) => setInclusionInput(e.target.value)}
                onKeyDown={handleAddInclusion}
                placeholder="e.g. 100 Heart Balloons, 2 Fairy Light Strings, LOVE Foil Set..."
                className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <button
                type="button"
                onClick={handleAddInclusion}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors"
              >
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {formData.inclusions.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-xs"
                >
                  <span className="flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle2 size={13} className="text-emerald-500" /> {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInclusion(idx)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Available Cities Filter */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" /> Delivery & Setup Cities
              </span>
              <span className="text-[11px] text-pink-600 font-bold">
                Pilot City: Faridabad
              </span>
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={handleAddCity}
                placeholder="e.g. Faridabad..."
                className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={handleAddCity}
                className="px-4 py-2.5 rounded-2xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors"
              >
                Add City
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.availableCities.map((city) => (
                <span
                  key={city}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-semibold flex items-center gap-1.5"
                >
                  {city}
                  <button
                    type="button"
                    onClick={() => handleRemoveCity(city)}
                    className="hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 4: SEO Suite & Google Search Snippet */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe size={16} className="text-purple-500" /> SEO & Google Search Snippet
              </h3>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                SSR & Schema Ready
              </span>
            </div>

            {/* Google SERP Live Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">
                Google Search Preview
              </span>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono truncate">
                https://giftcart.com/decorations/{formData.slug || "package-slug"}
              </div>
              <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
                {formData.seoTitle || formData.title || "Package Title • GiftCart Decorations"}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {formData.seoDescription || formData.summary || "Surprise hotel room and party decoration service in Faridabad with same-day setup."}
              </div>
            </div>

            {/* SEO Meta Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">SEO Meta Title</label>
                <span className={`text-[10px] font-bold ${formData.seoTitle.length > 60 ? "text-amber-500" : "text-muted-foreground"}`}>
                  {formData.seoTitle.length}/60 chars
                </span>
              </div>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                placeholder="e.g. Romantic Hotel Room Decoration in Faridabad | GiftCart"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            {/* SEO Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">SEO Meta Description</label>
                <span className={`text-[10px] font-bold ${formData.seoDescription.length > 160 ? "text-amber-500" : "text-muted-foreground"}`}>
                  {formData.seoDescription.length}/160 chars
                </span>
              </div>
              <textarea
                name="seoDescription"
                rows={3}
                value={formData.seoDescription}
                onChange={handleChange}
                placeholder="e.g. Book romantic rose petal & balloon decoration for hotel rooms in Faridabad. Ready 2 hours before surprise entry with zero wall damage guarantee."
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
              />
            </div>

            {/* SEO Keywords */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">SEO Target Keywords (comma separated)</label>
              <input
                type="text"
                name="seoKeywords"
                value={formData.seoKeywords}
                onChange={handleChange}
                placeholder="hotel room decor faridabad, romantic anniversary setup, balloon surprise"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Media & Images */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ImageIcon size={16} className="text-pink-500" /> Cover Photo & Gallery
            </h3>

            {/* Cover Photo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Main Cover Photo</label>
              <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 overflow-hidden flex flex-col items-center justify-center text-center p-3 group">
                {formData.coverImage ? (
                  <>
                    <img
                      src={formData.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMediaTarget("cover");
                          setShowMediaModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-pink-500 text-white text-xs font-bold"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, coverImage: "" }))}
                        className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMediaTarget("cover");
                      setShowMediaModal(true);
                    }}
                    className="p-3 text-center space-y-1 text-muted-foreground hover:text-pink-500 transition-colors"
                  >
                    <Upload size={22} className="mx-auto" />
                    <p className="text-xs font-bold">Pick Cover from Media</p>
                  </button>
                )}
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Additional Gallery Photos</label>
                <button
                  type="button"
                  onClick={() => {
                    setMediaTarget("gallery");
                    setShowMediaModal(true);
                  }}
                  className="text-xs font-bold text-pink-500 hover:underline flex items-center gap-1"
                >
                  <Plus size={13} /> Add Photo
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {formData.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 group"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="absolute top-1 right-1 p-1 rounded-lg bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Save size={16} />
            <span>
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Publish Decoration Package"}
            </span>
          </button>
        </div>
      </form>

      {/* Media Selector Modal */}
      {showMediaModal && (
        <MediaModal
          onClose={() => setShowMediaModal(false)}
          onSelect={(url) => {
            const singleUrl = Array.isArray(url) ? url[0] : url;
            if (mediaTarget === "cover") {
              setFormData((prev) => ({ ...prev, coverImage: singleUrl }));
            } else {
              setFormData((prev) => ({ ...prev, images: [...prev.images, singleUrl] }));
            }
            setShowMediaModal(false);
          }}
        />
      )}
    </div>
  );
}
