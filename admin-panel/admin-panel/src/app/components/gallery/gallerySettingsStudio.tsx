"use client";

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Globe,
  Sparkles,
  Check,
  Save,
  LayoutGrid,
  Columns,
  Film,
  Sliders,
  Heart,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import {
  getGallerySettings,
  updateGallerySettings,
  GallerySettings,
} from "../../services/galleryService";

const MOBILE_LAYOUT_OPTIONS = [
  {
    id: "masonry",
    name: "Masonry Feed",
    badge: "Pinterest Style",
    desc: "2-column staggered dynamic height cards with gradient overlays.",
    icon: Columns,
  },
  {
    id: "grid",
    name: "Square Grid",
    badge: "Instagram Style",
    desc: "3-column uniform 1:1 square photo grid. Dense, clean & high-speed.",
    icon: LayoutGrid,
  },
  {
    id: "feed",
    name: "Story Reels Feed",
    badge: "Reels / TikTok",
    desc: "Single-column full-width vertical story cards with rich overlay.",
    icon: Film,
  },
  {
    id: "carousel",
    name: "Snap Carousel",
    badge: "Story Cards",
    desc: "Horizontal swipeable card slider with auto-snap animation.",
    icon: SlidersHorizontal,
  },
];

const WEB_LAYOUT_OPTIONS = [
  {
    id: "masonry",
    name: "Masonry Wall",
    badge: "Creative Wall",
    desc: "Responsive multi-column masonry brick wall layout.",
    icon: Columns,
  },
  {
    id: "grid",
    name: "Standard Grid",
    badge: "Modern 4-Column",
    desc: "Symmetric 3 or 4-column card grid with hover zoom effects.",
    icon: LayoutGrid,
  },
  {
    id: "carousel",
    name: "Panoramic Carousel",
    badge: "Interactive Slider",
    desc: "Smooth panoramic card slider with previous/next controls.",
    icon: Sliders,
  },
  {
    id: "slideshow",
    name: "Full-width Slideshow",
    badge: "Hero Banner",
    desc: "Full-width immersive hero carousel with large photo focus.",
    icon: Film,
  },
];

interface GallerySettingsStudioProps {
  onClose?: () => void;
  onSaved?: () => void;
}

export default function GallerySettingsStudio({
  onClose,
  onSaved,
}: GallerySettingsStudioProps) {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [mobileLayout, setMobileLayout] = useState<GallerySettings["mobileLayout"]>("masonry");
  const [webLayout, setWebLayout] = useState<GallerySettings["webLayout"]>("masonry");
  const [title, setTitle] = useState("Moments of Joy 📸");
  const [subtitle, setSubtitle] = useState("Real customer celebrations & deliveries");
  const [enableLikes, setEnableLikes] = useState(true);
  const [enableShopLook, setEnableShopLook] = useState(true);

  useEffect(() => {
    getGallerySettings()
      .then((res) => {
        if (res?.success && res.data) {
          const s = res.data;
          setMobileLayout(s.mobileLayout || "masonry");
          setWebLayout(s.webLayout || "masonry");
          setTitle(s.title || "Moments of Joy 📸");
          setSubtitle(s.subtitle || "Real customer celebrations & deliveries");
          setEnableLikes(s.enableLikes !== false);
          setEnableShopLook(s.enableShopLook !== false);
        }
      })
      .catch((err) => console.warn("Failed to load settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateGallerySettings({
        mobileLayout,
        webLayout,
        title: title.trim(),
        subtitle: subtitle.trim(),
        enableLikes,
        enableShopLook,
      });
      showToast("Gallery design & layout settings saved successfully! 🚀", "success");
      if (onSaved) onSaved();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update layout settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border-theme p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-200">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-theme pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-1.5">
            <Sparkles size={13} />
            Multi-Platform UI Design Studio
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Configure Gallery Design for Mobile & Website
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Switch your visual layout anytime from here. The Mobile App and Website will dynamically update their layouts instantly without needing an app release!
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-primary/25 disabled:opacity-50 transition shrink-0"
        >
          <Save size={15} />
          <span>{saving ? "Applying..." : "Save & Apply Layout"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: MOBILE APP LAYOUT SELECTOR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Smartphone size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Mobile App Gallery Layout
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select how celebration photos & reels appear in the Android / iOS App
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Active: {mobileLayout.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOBILE_LAYOUT_OPTIONS.map((opt) => {
              const isSelected = mobileLayout === opt.id;
              const Icon = opt.icon;

              return (
                <div
                  key={opt.id}
                  onClick={() => setMobileLayout(opt.id as any)}
                  className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                      : "border-border-theme hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                      <Check size={12} />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-xl ${isSelected ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {opt.badge}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                      {opt.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {opt.desc}
                    </p>

                    {/* Interactive Wireframe Preview */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-border-theme flex items-center justify-center min-h-[56px]">
                      {opt.id === "masonry" && (
                        <div className="flex gap-1.5 w-full justify-center">
                          <div className="flex flex-col gap-1 w-7">
                            <div className="h-7 rounded bg-primary/40" />
                            <div className="h-4 rounded bg-primary/20" />
                          </div>
                          <div className="flex flex-col gap-1 w-7">
                            <div className="h-4 rounded bg-primary/20" />
                            <div className="h-7 rounded bg-primary/40" />
                          </div>
                        </div>
                      )}
                      {opt.id === "grid" && (
                        <div className="grid grid-cols-3 gap-1 w-20">
                          {[1, 2, 3, 4, 5, 6].map((k) => (
                            <div key={k} className="h-4 rounded bg-primary/30" />
                          ))}
                        </div>
                      )}
                      {opt.id === "feed" && (
                        <div className="w-16 h-11 rounded border border-primary/30 flex flex-col justify-between p-1 bg-primary/10">
                          <div className="w-6 h-1 rounded bg-primary/40" />
                          <div className="w-full h-5 rounded bg-primary/30" />
                          <div className="w-8 h-1.5 rounded-full bg-primary" />
                        </div>
                      )}
                      {opt.id === "carousel" && (
                        <div className="flex items-center gap-1 w-full justify-center overflow-hidden">
                          <div className="w-4 h-9 rounded bg-primary/15 shrink-0" />
                          <div className="w-12 h-11 rounded bg-primary/40 shadow-sm shrink-0 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white/70" />
                          </div>
                          <div className="w-4 h-9 rounded bg-primary/15 shrink-0" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: WEBSITE / STOREFRONT LAYOUT SELECTOR */}
        <div className="space-y-4 pt-4 border-t border-border-theme">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Globe size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Website / Web Storefront Layout
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select how moments are presented to desktop and web visitors
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Active: {webLayout.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WEB_LAYOUT_OPTIONS.map((opt) => {
              const isSelected = webLayout === opt.id;
              const Icon = opt.icon;

              return (
                <div
                  key={opt.id}
                  onClick={() => setWebLayout(opt.id as any)}
                  className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/20 shadow-md"
                      : "border-border-theme hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <Check size={12} />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-xl ${isSelected ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        {opt.badge}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                      {opt.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {opt.desc}
                    </p>

                    {/* Interactive Wireframe Preview */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-border-theme flex items-center justify-center min-h-[56px]">
                      {opt.id === "masonry" && (
                        <div className="flex gap-1 w-full justify-center">
                          <div className="flex flex-col gap-1 w-5">
                            <div className="h-6 rounded bg-blue-500/40" />
                            <div className="h-3 rounded bg-blue-500/20" />
                          </div>
                          <div className="flex flex-col gap-1 w-5">
                            <div className="h-3 rounded bg-blue-500/20" />
                            <div className="h-6 rounded bg-blue-500/40" />
                          </div>
                          <div className="flex flex-col gap-1 w-5">
                            <div className="h-5 rounded bg-blue-500/40" />
                            <div className="h-4 rounded bg-blue-500/20" />
                          </div>
                        </div>
                      )}
                      {opt.id === "grid" && (
                        <div className="grid grid-cols-4 gap-1 w-24">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
                            <div key={k} className="h-4 rounded bg-blue-500/30" />
                          ))}
                        </div>
                      )}
                      {opt.id === "carousel" && (
                        <div className="flex items-center gap-1 w-full justify-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500/30 flex items-center justify-center text-[7px] text-blue-600">‹</div>
                          <div className="w-14 h-9 rounded bg-blue-500/40 shadow-sm" />
                          <div className="w-3 h-3 rounded-full bg-blue-500/30 flex items-center justify-center text-[7px] text-blue-600">›</div>
                        </div>
                      )}
                      {opt.id === "slideshow" && (
                        <div className="w-24 h-10 rounded border border-blue-500/30 p-1 flex flex-col justify-between bg-blue-500/10">
                          <div className="w-full h-6 rounded bg-blue-500/30" />
                          <div className="flex justify-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30" />
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: DISPLAY LABELS & FEATURE SWITCHES */}
        <div className="p-6 rounded-2xl border border-border-theme bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Titles & Global Features
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Gallery Section Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Moments of Joy 📸"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Gallery Section Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Real customer celebrations & deliveries"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-theme bg-card cursor-pointer hover:bg-hover-theme transition">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Heart size={13} className="text-rose-500 fill-rose-500" />
                  Enable Customer Likes Counter
                </div>
                <div className="text-[11px] text-slate-500">
                  Allow customers to like photos & videos
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableLikes}
                onChange={(e) => setEnableLikes(e.target.checked)}
                className="w-5 h-5 rounded accent-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-theme bg-card cursor-pointer hover:bg-hover-theme transition">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShoppingBag size={13} className="text-primary" />
                  Enable &ldquo;Shop This Look&rdquo; Button
                </div>
                <div className="text-[11px] text-slate-500">
                  Show order button when a product is linked
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableShopLook}
                onChange={(e) => setEnableShopLook(e.target.checked)}
                className="w-5 h-5 rounded accent-primary cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="pt-6 border-t border-border-theme flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border-theme shadow-sm">
          <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">
              Live Configuration: Changes apply immediately to App and Website users.
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-border-theme text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-hover-theme transition"
              >
                Close Studio
              </button>
            )}
            <button
              type="submit"
              disabled={saving || loading}
              className="flex-1 sm:flex-initial px-8 py-3 rounded-xl bg-primary hover:opacity-90 text-white text-xs font-black shadow-lg shadow-primary/30 disabled:opacity-50 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Save size={16} />
              <span>{saving ? "Applying Changes..." : "Save & Apply Layout Settings"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
