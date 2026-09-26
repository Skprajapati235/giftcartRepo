"use client";

import React, { useState } from "react";
import { Upload, X, ArrowRight, Sparkles, Smartphone } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useToast } from "../../../context/ToastContext";
import MediaModal from "../ui/MediaModal";

interface AddEditHeroSlideProps {
  slide?: any;
  onClose: () => void;
}

export default function AddEditHeroSlide({ slide, onClose }: AddEditHeroSlideProps) {
  const { categories, createHeroSlide, updateHeroSlide } = useAdmin();
  const { showToast } = useToast();

  const [tag, setTag] = useState(slide?.tag || "");
  const [title, setTitle] = useState(slide?.title || "");
  const [desc, setDesc] = useState(slide?.desc || "");
  const [cta, setCta] = useState(slide?.cta || "Shop Now");
  const [categoryMatch, setCategoryMatch] = useState(slide?.categoryMatch || "");
  const [customCategory, setCustomCategory] = useState("");
  const [image, setImage] = useState(slide?.image || slide?.img || "");
  const [order, setOrder] = useState<number>(slide?.order ?? 0);
  const [isActive, setIsActive] = useState<boolean>(slide?.isActive !== false);

  const [saving, setSaving] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Check if current categoryMatch is one of existing categories
  const isPresetCategory = categories.some(
    (c: any) =>
      c._id === categoryMatch ||
      c.name.toLowerCase() === categoryMatch.toLowerCase()
  );

  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setCategoryMatch(customCategory);
    } else {
      setCategoryMatch(val);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      showToast("Please enter a title for the slide", "error");
      return;
    }
    if (!image.trim()) {
      showToast("Please provide a banner image", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        tag: tag.trim(),
        title: title.trim(),
        desc: desc.trim(),
        cta: cta.trim() || "Shop Now",
        categoryMatch: categoryMatch.trim(),
        image: image.trim(),
        order: Number(order) || 0,
        isActive,
      };

      if (slide?._id) {
        await updateHeroSlide(slide._id, payload);
        showToast("Hero slide updated successfully!", "success");
      } else {
        await createHeroSlide(payload);
        showToast("Hero slide created successfully!", "success");
      }
      onClose();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to save hero slide", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-card rounded-3xl border border-border-theme p-6 sm:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8 border-b border-border-theme pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {slide?._id ? "Edit Hero Slide" : "Create New Hero Slide"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure mobile home carousel banner, targeting category, and visual assets.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl transition"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Tag */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Badge / Tag
            </label>
            <div className="relative">
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder="e.g. Fresh Blooms, Artisan Cakes, Curated Hampers"
              />
              <Sparkles size={16} className="absolute right-4 top-3.5 text-amber-500 opacity-60" />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Slide Title <span className="text-rose-500">*</span>
              <span className="text-[11px] font-normal text-slate-400 normal-case ml-2">
                (Press Enter / newline to break lines)
              </span>
            </label>
            <textarea
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition resize-none"
              placeholder="e.g. Flowers Worth&#10;Every Celebration"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Description
            </label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
              placeholder="e.g. Hand-tied bouquets delivered within hours, farm to doorstep."
            />
          </div>

          {/* CTA & Category Match Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                CTA Button Text
              </label>
              <input
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder="e.g. Shop Flowers"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Category Match
              </label>
              <select
                value={isPresetCategory ? categoryMatch : categoryMatch ? "__custom__" : ""}
                onChange={handleCategorySelectChange}
                className="w-full rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
              >
                <option value="">-- No Category Filter --</option>
                {categories.map((c: any) => (
                  <option key={c._id} value={c.name.toLowerCase()}>
                    {c.name}
                  </option>
                ))}
                <option value="__custom__">Custom Keyword...</option>
              </select>
            </div>
          </div>

          {/* Custom Category Input if selected */}
          {(!isPresetCategory && categoryMatch) || categoryMatch === "__custom__" ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Custom Category Keyword or ID
              </label>
              <input
                value={categoryMatch === "__custom__" ? customCategory : categoryMatch}
                onChange={(e) => {
                  setCustomCategory(e.target.value);
                  setCategoryMatch(e.target.value);
                }}
                className="w-full rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder="e.g. flower, cake, combo"
              />
            </div>
          ) : null}

          {/* Image URL & Upload button */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Banner Image URL <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1 rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder="https://images.unsplash.com/... or upload"
                required
              />
              <button
                type="button"
                onClick={() => setShowMediaModal(true)}
                className="cursor-pointer flex items-center gap-1.5 px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl text-xs font-bold transition whitespace-nowrap"
              >
                <Upload size={16} />
                Media Library
              </button>
            </div>
          </div>

          {/* Order and Active Toggle Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Display Order Index
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                min={0}
                placeholder="0, 1, 2..."
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isActive ? "Visible on Mobile" : "Hidden"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile Phone Card Preview (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone size={15} className="text-primary" /> Live Mobile Card Preview
            </span>
            <span className="text-[11px] text-slate-400">Matches mobile UI</span>
          </div>

          <div className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-4 flex flex-col items-center justify-center">
            {/* Simulated Mobile Card */}
            <div
              className="relative w-full overflow-hidden rounded-2xl shadow-md border border-[#F3C8D5]/30 bg-[#FFF5F8] dark:bg-[#201518]"
              style={{ minHeight: "185px" }}
            >
              {/* Right Image Container */}
              <div className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={title || "Preview"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                    No image
                  </div>
                )}
                {/* Seamless feather gradient fade */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, #FFF5F8 0%, rgba(255,245,248,0.95) 20%, rgba(255,245,248,0.5) 45%, transparent 100%)",
                  }}
                />
              </div>

              {/* Left Content */}
              <div className="relative z-10 p-4 max-w-[62%] flex flex-col justify-between min-h-[185px]">
                <div>
                  {tag ? (
                    <div className="inline-flex items-center gap-1 bg-[#832729]/10 px-2 py-0.5 rounded-full mb-1.5 border border-[#832729]/15">
                      <span className="text-[10px] font-bold text-[#832729]">✨ {tag}</span>
                    </div>
                  ) : null}

                  <h3 className="text-sm font-extrabold text-[#1F2937] dark:text-white leading-tight whitespace-pre-line mb-1">
                    {title || "Flowers Worth\nEvery Celebration"}
                  </h3>

                  <p className="text-[11px] text-[#4B5563] dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {desc || "Hand-tied bouquets delivered within hours, farm to doorstep."}
                  </p>
                </div>

                <div className="mt-3">
                  <div className="inline-flex items-center gap-1.5 bg-[#832729] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    <span>{cta || "Shop Now"}</span>
                    <ArrowRight size={11} />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 text-center">
              Target filter: <strong className="text-slate-600 dark:text-slate-300">{categoryMatch || "All Collections"}</strong> • Order: #{order}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-12 pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border-theme">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-32 border border-border-theme text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-hover-theme transition text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-40 bg-primary text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-50 text-center"
          >
            {saving ? "Saving..." : slide?._id ? "Update Slide" : "Create Slide"}
          </button>
        </div>
      </form>

      {showMediaModal && (
        <MediaModal
          onClose={() => setShowMediaModal(false)}
          onSelect={(url) => {
            setImage(url as string);
            setShowMediaModal(false);
          }}
          multiple={false}
        />
      )}
    </section>
  );
}
