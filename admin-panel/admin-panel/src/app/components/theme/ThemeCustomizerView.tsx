"use client";

import React, { useState, useEffect } from "react";
import {
  Palette,
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  Smartphone,
  Monitor,
  Eye,
  CheckCircle2,
  Megaphone,
  Type,
  Layers,
  ShoppingBag,
  Heart,
  Star,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { themeService, StoreThemeConfig, THEME_PRESETS } from "../../services/themeService";
import { useToast } from "../../../context/ToastContext";

export default function ThemeCustomizerView() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const [theme, setTheme] = useState<StoreThemeConfig>(THEME_PRESETS[0].config as StoreThemeConfig);
  const [activePreset, setActivePreset] = useState<string>("festive-pink");

  useEffect(() => {
    async function load() {
      try {
        const data = await themeService.getTheme();
        if (data) {
          setTheme(data);
          setActivePreset(data.presetId || "custom");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleApplyPreset = (preset: typeof THEME_PRESETS[0]) => {
    setActivePreset(preset.id);
    setTheme((prev) => ({
      ...prev,
      ...preset.config,
      presetId: preset.id,
      presetName: preset.name,
      announcementBar: {
        ...prev.announcementBar,
        ...preset.config.announcementBar,
      },
    }));
    showToast(`Applied preset: ${preset.name}`, "info");
  };

  const handleColorChange = (key: keyof StoreThemeConfig, value: string) => {
    setActivePreset("custom");
    setTheme((prev) => ({
      ...prev,
      [key]: value,
      presetId: "custom",
      presetName: "Custom Palette",
    }));
  };

  const handleAnnouncementChange = (field: string, value: any) => {
    setTheme((prev) => ({
      ...prev,
      announcementBar: {
        ...prev.announcementBar,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await themeService.updateTheme(theme);
      showToast(res.message, "success");
    } catch (e: any) {
      showToast(e?.message || "Failed to update theme", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultPreset = THEME_PRESETS[0];
    handleApplyPreset(defaultPreset);
    showToast("Reset to factory Festive Pink theme", "info");
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Loading Theme Customizer Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border-theme bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
              <Palette className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Storefront Theme & Branding Studio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Control the visual look, festival color palettes, and announcement banner on the customer storefront in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open User Store</span>
          </a>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-pink-500/25 hover:bg-pink-600 active:scale-95 transition disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Publish to Storefront</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Simulator on Right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Theme Presets & Customizer Options (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Preset Selector */}
          <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-pink-500" />
                  Festival & Event Presets
                </h3>
                <p className="text-xs text-slate-500">
                  Instantly switch between curated season and festival designs.
                </p>
              </div>
              <span className="rounded-full bg-pink-500/10 px-2.5 py-1 text-[11px] font-extrabold text-pink-500">
                {activePreset.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {THEME_PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-pink-500 bg-pink-500/5 shadow-md shadow-pink-500/10"
                        : "border-border-theme bg-background/50 hover:border-pink-500/40 hover:bg-hover-theme"
                    }`}
                  >
                    <div>
                      {/* Gradient Bar Preview */}
                      <div
                        className={`h-2.5 w-full rounded-full bg-gradient-to-r ${preset.previewGradient} mb-3 shadow-xs`}
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{preset.name}</span>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-pink-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {preset.tagline}
                      </p>
                    </div>

                    {/* Color Swatch Dots */}
                    <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-border-theme/40">
                      <span
                        className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: preset.config.primaryColor }}
                        title="Primary"
                      />
                      <span
                        className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: preset.config.secondaryColor }}
                        title="Secondary"
                      />
                      <span
                        className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: preset.config.brandBerry }}
                        title="Brand Berry"
                      />
                      <span
                        className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: preset.config.brandGold }}
                        title="Brand Gold"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Palettes Detail */}
          <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Palette className="h-4 w-4 text-pink-500" />
                Custom Color Adjustments
              </h3>
              <p className="text-xs text-slate-500">
                Fine-tune individual storefront CSS variables.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Primary Color */}
              <div className="rounded-2xl border border-border-theme bg-background p-3.5 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-foreground block">Primary Brand Color</label>
                  <span className="text-[10px] text-slate-400">Buttons, Active Tabs, Key Badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.primaryColor || "#D82B76"}
                    onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase">
                    {theme.primaryColor}
                  </span>
                </div>
              </div>

              {/* Secondary Color */}
              <div className="rounded-2xl border border-border-theme bg-background p-3.5 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-foreground block">Secondary Accent</label>
                  <span className="text-[10px] text-slate-400">Special offers, CTAs, Highlights</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.secondaryColor || "#FF6A3D"}
                    onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase">
                    {theme.secondaryColor}
                  </span>
                </div>
              </div>

              {/* Brand Berry / Deep Contrast */}
              <div className="rounded-2xl border border-border-theme bg-background p-3.5 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-foreground block">Deep Brand Berry</label>
                  <span className="text-[10px] text-slate-400">Headers, Top Bar, Contrast Text</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.brandBerry || "#741343"}
                    onChange={(e) => handleColorChange("brandBerry", e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase">
                    {theme.brandBerry}
                  </span>
                </div>
              </div>

              {/* Brand Gold / Highlight */}
              <div className="rounded-2xl border border-border-theme bg-background p-3.5 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-foreground block">Brand Gold Accent</label>
                  <span className="text-[10px] text-slate-400">Stars, Ratings, Festive Sparkles</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.brandGold || "#ffd166"}
                    onChange={(e) => handleColorChange("brandGold", e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase">
                    {theme.brandGold}
                  </span>
                </div>
              </div>

              {/* Brand Cream / Soft Surface */}
              <div className="rounded-2xl border border-border-theme bg-background p-3.5 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-foreground block">Cream Soft Background</label>
                  <span className="text-[10px] text-slate-400">Card backgrounds, Icon circles</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.brandCream || "#fffaf3"}
                    onChange={(e) => handleColorChange("brandCream", e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase">
                    {theme.brandCream}
                  </span>
                </div>
              </div>

              {/* Background Color */}
              <div className="rounded-2xl border border-border-theme bg-background p-3.5 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-foreground block">Store Canvas Background</label>
                  <span className="text-[10px] text-slate-400">Main page background</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.backgroundColor || "#ffffff"}
                    onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase">
                    {theme.backgroundColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Announcement Bar Customizer */}
          <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-pink-500" />
                  Store Announcement Bar
                </h3>
                <p className="text-xs text-slate-500">
                  Top promotional bar displayed across all storefront pages.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={theme.announcementBar?.enabled ?? true}
                  onChange={(e) => handleAnnouncementChange("enabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {theme.announcementBar?.enabled && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                    Announcement Banner Message
                  </label>
                  <input
                    type="text"
                    value={theme.announcementBar?.text || ""}
                    onChange={(e) => handleAnnouncementChange("text", e.target.value)}
                    placeholder="e.g. 🎉 Flat 20% OFF on Midnight Deliveries! Use Code FESTIVE20"
                    className="w-full rounded-2xl border border-border-theme bg-background px-4 py-2.5 text-xs sm:text-sm text-foreground focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                      Bar Background
                    </label>
                    <div className="flex items-center gap-2 rounded-2xl border border-border-theme bg-background p-2">
                      <input
                        type="color"
                        value={theme.announcementBar?.bgColor || "#741343"}
                        onChange={(e) => handleAnnouncementChange("bgColor", e.target.value)}
                        className="h-7 w-7 rounded-lg border-0 bg-transparent p-0 cursor-pointer"
                      />
                      <span className="text-xs font-mono">{theme.announcementBar?.bgColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2 rounded-2xl border border-border-theme bg-background p-2">
                      <input
                        type="color"
                        value={theme.announcementBar?.textColor || "#ffffff"}
                        onChange={(e) => handleAnnouncementChange("textColor", e.target.value)}
                        className="h-7 w-7 rounded-lg border-0 bg-transparent p-0 cursor-pointer"
                      />
                      <span className="text-xs font-mono">{theme.announcementBar?.textColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                      Action Link
                    </label>
                    <input
                      type="text"
                      value={theme.announcementBar?.link || "/categories"}
                      onChange={(e) => handleAnnouncementChange("link", e.target.value)}
                      className="w-full rounded-2xl border border-border-theme bg-background px-3 py-2 text-xs text-foreground focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tagline & Brand Identity */}
          <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Type className="h-4 w-4 text-pink-500" />
                Store Tagline & Trust Badges
              </h3>
              <p className="text-xs text-slate-500">
                Headline copy shown on the home page hero section.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                  Storefront Tagline
                </label>
                <input
                  type="text"
                  value={theme.storeTagline || ""}
                  onChange={(e) => setTheme({ ...theme, storeTagline: e.target.value })}
                  className="w-full rounded-2xl border border-border-theme bg-background px-4 py-2.5 text-xs sm:text-sm text-foreground focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                  Quality Badge Text
                </label>
                <input
                  type="text"
                  value={theme.badgeText || ""}
                  onChange={(e) => setTheme({ ...theme, badgeText: e.target.value })}
                  className="w-full rounded-2xl border border-border-theme bg-background px-4 py-2.5 text-xs sm:text-sm text-foreground focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Storefront Simulator (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="sticky top-6 rounded-3xl border border-border-theme bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-theme">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-pink-500" />
                <span className="text-sm font-black text-foreground">Live Store Simulator</span>
              </div>

              {/* Device Selector */}
              <div className="flex items-center rounded-xl border border-border-theme bg-background p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    previewDevice === "desktop"
                      ? "bg-pink-500 text-white"
                      : "text-slate-500 hover:text-foreground"
                  }`}
                >
                  <Monitor className="h-3 w-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    previewDevice === "mobile"
                      ? "bg-pink-500 text-white"
                      : "text-slate-500 hover:text-foreground"
                  }`}
                >
                  <Smartphone className="h-3 w-3" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Virtual Browser Mockup Container */}
            <div
              className={`mx-auto overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-700 bg-white text-slate-900 shadow-xl transition-all duration-300 ${
                previewDevice === "mobile" ? "max-w-[320px]" : "w-full"
              }`}
            >
              {/* Browser Window Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-3 py-1.5">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[160px]">
                  giftfestive.com
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">● LIVE</span>
              </div>

              {/* Dynamic Live Announcement Bar */}
              {theme.announcementBar?.enabled && (
                <div
                  className="px-3 py-1.5 text-center text-[10px] font-bold tracking-wide transition-colors"
                  style={{
                    backgroundColor: theme.announcementBar.bgColor || theme.brandBerry,
                    color: theme.announcementBar.textColor || "#ffffff",
                  }}
                >
                  {theme.announcementBar.text}
                </div>
              )}

              {/* Storefront Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 bg-white">
                <div className="flex items-center gap-1.5">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-white font-black text-xs"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    G
                  </span>
                  <span
                    className="text-xs font-black tracking-tight"
                    style={{ color: theme.brandBerry }}
                  >
                    GiftFestive
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">Faridabad</span>
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px]"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <ShoppingBag className="h-3 w-3" />
                  </div>
                </div>
              </div>

              {/* Simulated Hero Banner */}
              <div
                className="p-4 text-white relative overflow-hidden transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${theme.brandBerry} 0%, ${theme.primaryColor} 60%, ${theme.secondaryColor} 100%)`,
                }}
              >
                <div className="relative z-10 space-y-1">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider"
                    style={{
                      backgroundColor: theme.brandGold,
                      color: theme.brandBerry,
                    }}
                  >
                    {theme.badgeText || "Midnight Delivery"}
                  </span>
                  <h4 className="text-sm font-black leading-tight text-white">
                    {theme.storeTagline || "Celebrations Delivered with Love"}
                  </h4>
                  <p className="text-[10px] text-white/80">Fresh cakes, flowers & handcrafted gift hampers</p>
                </div>

                {/* Decorative circle glow */}
                <div
                  className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full opacity-30 blur-lg"
                  style={{ backgroundColor: theme.brandGold }}
                />
              </div>

              {/* Simulated Product Card Sandbox */}
              <div className="p-3 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-800">Trending Right Now</span>
                  <span
                    className="text-[10px] font-bold cursor-pointer"
                    style={{ color: theme.primaryColor }}
                  >
                    View All →
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs flex gap-3 items-center">
                  <div
                    className="h-16 w-16 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                    style={{ backgroundColor: theme.brandCream, color: theme.brandBerry }}
                  >
                    🎂 Cake
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: theme.brandGold }}>
                      <Star className="h-3 w-3 fill-current" />
                      <span className="font-black text-slate-800">4.9</span>
                      <span className="text-slate-400">(120+ reviews)</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      Belgian Dark Truffle Cake
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-black text-slate-900">₹599</span>
                      <span className="text-[10px] text-slate-400 line-through">₹799</span>
                      <span
                        className="text-[9px] font-bold px-1 rounded-sm"
                        style={{ backgroundColor: theme.brandGold, color: theme.brandBerry }}
                      >
                        25% OFF
                      </span>
                    </div>

                    <button
                      type="button"
                      className="mt-1.5 w-full rounded-lg py-1 text-[10px] font-bold text-white transition-transform active:scale-95 shadow-xs"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulator Footer Badge */}
              <div className="border-t border-slate-200 bg-white px-3 py-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>GiftFestive Verified Storefront</span>
              </div>
            </div>

            {/* Generated CSS Variables Inspect Box */}
            <div className="rounded-2xl border border-border-theme bg-background p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Generated CSS Variables
              </span>
              <pre className="text-[10px] font-mono text-slate-600 dark:text-slate-300 overflow-x-auto p-2 rounded-xl bg-card border border-border-theme/50">
{`:root {
  --primary: ${theme.primaryColor};
  --secondary: ${theme.secondaryColor};
  --brand-berry: ${theme.brandBerry};
  --brand-gold: ${theme.brandGold};
  --brand-cream: ${theme.brandCream};
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
