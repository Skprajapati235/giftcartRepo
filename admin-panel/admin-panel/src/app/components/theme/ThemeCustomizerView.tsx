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
  Check,
  Sun,
  Moon,
  LayoutDashboard,
  Sliders,
  RefreshCw,
  Wand2,
  SlidersHorizontal,
} from "lucide-react";
import { themeService, StoreThemeConfig, THEME_PRESETS } from "../../services/themeService";
import { useToast } from "../../../context/ToastContext";
import { useTheme, ADMIN_COLOR_PRESETS } from "../../context/ThemeContext";

export default function ThemeCustomizerView() {
  const { showToast } = useToast();
  const {
    theme: adminThemeMode,
    toggleTheme: toggleAdminMode,
    adminColor,
    setAdminColorPreset,
    setCustomAdminColor,
    syncWithWebsiteTheme,
    resetAdminTheme,
  } = useTheme();

  const [activeTab, setActiveTab] = useState<"admin" | "storefront">("admin");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Storefront theme state
  const [theme, setTheme] = useState<StoreThemeConfig>(THEME_PRESETS[0].config as StoreThemeConfig);
  const [activePreset, setActivePreset] = useState<string>("festive-pink");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Custom Admin Colors local inputs
  const [customPrimary, setCustomPrimary] = useState(adminColor.primary);
  const [customSecondary, setCustomSecondary] = useState(adminColor.secondary);

  // Sync custom inputs whenever adminColor changes
  useEffect(() => {
    setCustomPrimary(adminColor.primary);
    setCustomSecondary(adminColor.secondary);
  }, [adminColor.primary, adminColor.secondary]);

  // Read URL query param to open specific tab if specified
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "storefront") {
        setActiveTab("storefront");
      } else if (tabParam === "admin") {
        setActiveTab("admin");
      }
    }
  }, []);

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

  // Storefront Handlers
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

  // Admin Theme Handlers
  const handleSelectAdminPreset = (presetId: string) => {
    setAdminColorPreset(presetId);
    const preset = ADMIN_COLOR_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      showToast(`Admin theme set to ${preset.name}!`, "success");
    }
  };

  const handleApplyCustomAdminColors = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomAdminColor(customPrimary, customSecondary);
    showToast(`Custom admin theme applied!`, "success");
  };

  const handleSyncWithWebsite = () => {
    const p = theme.primaryColor || "#D82B76";
    const s = theme.secondaryColor || "#FF6A3D";
    syncWithWebsiteTheme(p, s);
    setCustomPrimary(p);
    setCustomSecondary(s);
    showToast("Admin Panel synced with Storefront website theme!", "success");
  };

  const handleResetAdmin = () => {
    resetAdminTheme();
    setCustomPrimary(ADMIN_COLOR_PRESETS[0].primary);
    setCustomSecondary(ADMIN_COLOR_PRESETS[0].secondary);
    showToast("Admin Panel reset to default Festive Rose!", "info");
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Loading Theme Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Dual Tab Switcher: Admin Theme vs Storefront Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-theme pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            Theme & Branding Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Customize the look and feel of your Admin Dashboard or your Live Customer Storefront.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center rounded-2xl border border-border-theme bg-card p-1.5 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-black transition cursor-pointer ${
              activeTab === "admin"
                ? "bg-primary text-white shadow-md shadow-primary/25"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-hover-theme"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Admin Dashboard Theme</span>
            <span
              className="h-2.5 w-2.5 rounded-full border border-white/50"
              style={{ backgroundColor: adminColor.primary }}
              title={`Current: ${adminColor.name}`}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("storefront")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-black transition cursor-pointer ${
              activeTab === "storefront"
                ? "bg-primary text-white shadow-md shadow-primary/25"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-hover-theme"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Storefront Website Theme</span>
            <span
              className="h-2.5 w-2.5 rounded-full border border-white/50"
              style={{ backgroundColor: theme.primaryColor }}
              title={`Storefront: ${theme.primaryColor}`}
            />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ADMIN PANEL DASHBOARD THEME CUSTOMIZER                            */}
      {/* ========================================================================= */}
      {activeTab === "admin" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Admin Control Banner */}
          <div className="flex flex-col gap-4 rounded-3xl border border-border-theme bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-xs font-black text-sm"
                  style={{ background: adminColor.primaryGradient }}
                >
                  ⚡
                </span>
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    Admin Dashboard Appearance & Palette
                  </h2>
                  <p className="text-xs text-slate-500">
                    Active Theme: <span className="font-bold text-foreground">{adminColor.name}</span> • Changes take effect instantly across all dashboard pages!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sync with Website Theme Button */}
              <button
                type="button"
                onClick={handleSyncWithWebsite}
                className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-hover-theme transition"
                title="Synchronize admin panel colors with the customer website theme"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Sync with Website Theme</span>
              </button>

              {/* Light / Dark Mode Toggle */}
              <button
                type="button"
                onClick={toggleAdminMode}
                className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-hover-theme transition"
              >
                {adminThemeMode === "dark" ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span>Switch to Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-slate-500" />
                    <span>Switch to Dark</span>
                  </>
                )}
              </button>

              {/* Reset to Factory Rose */}
              <button
                type="button"
                onClick={handleResetAdmin}
                className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Rose</span>
              </button>
            </div>
          </div>

          {/* Admin Layout: Controls (7 cols) + Live Dashboard Mockup (5 cols) */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: 10 Admin Presets & Custom Pickers */}
            <div className="space-y-6 lg:col-span-7">
              {/* Curated Admin Palettes Grid */}
              <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      10 Curated Admin Dashboard Palettes
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pick any signature color theme. Your selection is automatically saved and remembered.
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-black text-white shadow-xs self-start sm:self-auto"
                    style={{ background: adminColor.primaryGradient }}
                  >
                    ACTIVE: {adminColor.name.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {ADMIN_COLOR_PRESETS.map((preset) => {
                    const isSelected = adminColor.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectAdminPreset(preset.id)}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-md shadow-primary/15 ring-2 ring-primary/40"
                            : "border-border-theme bg-background/60 hover:border-primary/40 hover:bg-hover-theme"
                        }`}
                      >
                        <div>
                          {/* Gradient Bar Preview */}
                          <div
                            className="h-3 w-full rounded-full mb-3 shadow-xs transition-transform group-hover:scale-[1.02]"
                            style={{ background: preset.primaryGradient }}
                          />
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-black text-sm text-foreground leading-tight">
                              {preset.name}
                            </span>
                            {isSelected ? (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <span
                                className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: preset.previewColor }}
                              />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {preset.description}
                          </p>
                        </div>

                        {/* Color Swatch Dots & CTA */}
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-border-theme/40">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-4 w-4 rounded-full border border-black/15 shadow-xs"
                              style={{ backgroundColor: preset.primary }}
                              title={`Primary: ${preset.primary}`}
                            />
                            <span
                              className="h-4 w-4 rounded-full border border-black/15 shadow-xs"
                              style={{ backgroundColor: preset.secondary }}
                              title={`Secondary: ${preset.secondary}`}
                            />
                            <span
                              className="h-4 w-4 rounded-full border border-black/15 shadow-xs"
                              style={{ backgroundColor: preset.accent }}
                              title={`Accent: ${preset.accent}`}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 group-hover:text-primary font-bold transition">
                            {isSelected ? "Active ✓" : "Apply →"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Admin Color Fine-Tuning */}
              <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    Custom Admin Hex Colors
                  </h3>
                  <p className="text-xs text-slate-500">
                    Want an exact custom company color? Set any custom primary and secondary hex values.
                  </p>
                </div>

                <form onSubmit={handleApplyCustomAdminColors} className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary Color Picker */}
                    <div className="rounded-2xl border border-border-theme bg-background p-3.5 flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-foreground block">
                          Primary Theme Color
                        </label>
                        <span className="text-[10px] text-slate-400">Buttons, Active Nav, Badges</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customPrimary}
                          onChange={(e) => setCustomPrimary(e.target.value)}
                          className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                        />
                        <input
                          type="text"
                          value={customPrimary}
                          onChange={(e) => setCustomPrimary(e.target.value)}
                          className="w-20 rounded-lg border border-border-theme bg-card px-2 py-1 text-xs font-mono font-bold text-foreground uppercase focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Secondary Color Picker */}
                    <div className="rounded-2xl border border-border-theme bg-background p-3.5 flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-foreground block">
                          Secondary Gradient Color
                        </label>
                        <span className="text-[10px] text-slate-400">Gradient Flow & Highlights</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customSecondary}
                          onChange={(e) => setCustomSecondary(e.target.value)}
                          className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                        />
                        <input
                          type="text"
                          value={customSecondary}
                          onChange={(e) => setCustomSecondary(e.target.value)}
                          className="w-20 rounded-lg border border-border-theme bg-card px-2 py-1 text-xs font-mono font-bold text-foreground uppercase focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gradient Preview Bar */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500">Resulting Gradient Preview:</span>
                    <div
                      className="h-4 w-full rounded-xl shadow-xs"
                      style={{
                        background: `linear-gradient(135deg, ${customPrimary} 0%, ${customSecondary} 100%)`,
                      }}
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-primary/25 hover:opacity-95 active:scale-95 transition"
                    >
                      <Wand2 className="h-4 w-4" />
                      <span>Apply Custom Palette to Dashboard</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Live Interactive Admin Dashboard Simulator (5 cols) */}
            <div className="space-y-4 lg:col-span-5">
              <div className="sticky top-6 rounded-3xl border border-border-theme bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-theme">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-sm font-black text-foreground">
                      Admin UI Live Component Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    ● REALTIME CSS
                  </span>
                </div>

                {/* Simulated Admin Dashboard Sandbox */}
                <div className="overflow-hidden rounded-2xl border border-border-theme bg-background p-4 space-y-4 shadow-md">
                  {/* Mini Header Mockup */}
                  <div className="flex items-center justify-between pb-3 border-b border-border-theme">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-white font-black text-xs shadow-xs"
                        style={{ background: adminColor.primaryGradient }}
                      >
                        GF
                      </div>
                      <span className="text-xs font-black text-foreground">GiftFestive Admin</span>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: adminColor.primaryGradient }}
                    >
                      Super Admin
                    </span>
                  </div>

                  {/* Mini Sidebar Navigation Link Mockup */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Active Navigation Item
                    </span>
                    <div
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm"
                      style={{ background: adminColor.primaryGradient }}
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Orders Pipeline</span>
                      </div>
                      <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[9px] font-black">
                        14 New
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-hover-theme">
                      <ShoppingBag className="h-4 w-4" />
                      <span>Product Catalog</span>
                    </div>
                  </div>

                  {/* Mini KPI Stat Card Mockup */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Stat Widget Component
                    </span>
                    <div className="rounded-2xl border border-border-theme bg-card p-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Today&apos;s Revenue</span>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white"
                          style={{ background: adminColor.primaryGradient }}
                        >
                          +18.4%
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-black text-foreground">₹1,42,850</span>
                        <span className="text-[10px] text-slate-400">42 orders</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Primary Action Button */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Primary Action Button
                    </span>
                    <button
                      type="button"
                      className="w-full rounded-xl py-2.5 text-xs font-black text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                      style={{ background: adminColor.primaryGradient }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>+ Create Special Cake Order</span>
                    </button>
                  </div>

                  {/* Sample Status Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Status Chips & Highlights
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-2xs"
                        style={{ backgroundColor: adminColor.primary }}
                      >
                        ● Dispatch Ready
                      </span>
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-2xs"
                        style={{ backgroundColor: adminColor.secondary }}
                      >
                        ⚡ Priority Delivery
                      </span>
                      <span className="rounded-full border border-border-theme bg-card px-2.5 py-1 text-[10px] font-bold text-foreground">
                        VIP Customer
                      </span>
                    </div>
                  </div>
                </div>

                {/* Generated CSS Variables Inspect Box */}
                <div className="rounded-2xl border border-border-theme bg-background p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Active Admin Root Variables
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      localStorage: giftcartAdminColor
                    </span>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-600 dark:text-slate-300 overflow-x-auto p-2 rounded-xl bg-card border border-border-theme/50">
{`:root {
  --primary: ${adminColor.primary};
  --primary-gradient: ${adminColor.primaryGradient};
  --secondary: ${adminColor.secondary};
  --accent-color: ${adminColor.accent};
}`}
                  </pre>
                </div>

                {/* Quick Info Box */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                  <div>
                    <span className="font-bold">Instant Persistent Theme:</span> Your chosen dashboard color is saved directly in browser storage and will be active whenever you log into the admin panel!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STOREFRONT WEBSITE THEME CUSTOMIZER (giftfestive.com)              */}
      {/* ========================================================================= */}
      {activeTab === "storefront" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Banner & Control Bar */}
          <div className="flex flex-col gap-4 rounded-3xl border border-border-theme bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
                  <Palette className="h-4 w-4" />
                </span>
                <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                  Storefront Theme & Branding Studio
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Control the visual look, festival color palettes, and announcement banner on the customer storefront in real-time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="https://giftfestive.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition"
                title="Open Live Website (giftfestive.com) in New Tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Go Website</span>
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
              <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-pink-500" />
                      Curated Festive & Brand Palettes
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select from 14 signature themes or filter by celebration style.
                    </p>
                  </div>
                  <span className="rounded-full bg-pink-500/10 px-3 py-1 text-[11px] font-black text-pink-500 border border-pink-500/20 self-start sm:self-auto">
                    ACTIVE: {activePreset.toUpperCase()}
                  </span>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-1">
                  {(["All", "Festivals", "Luxury", "Pastels", "Vibrant", "Dark Mode", "Gourmet"] as const).map((cat) => {
                    const isCatActive = selectedCategory === cat;
                    const count = cat === "All" ? THEME_PRESETS.length : THEME_PRESETS.filter((p) => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isCatActive
                            ? "bg-pink-500 text-white shadow-xs"
                            : "border border-border-theme bg-background text-slate-500 hover:text-foreground hover:bg-hover-theme"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="ml-1.5 text-[10px] opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-[600px] overflow-y-auto pr-1">
                  {THEME_PRESETS.filter((p) => selectedCategory === "All" || p.category === selectedCategory).map((preset) => {
                    const isSelected = activePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-pink-500 bg-pink-500/10 shadow-md shadow-pink-500/15 ring-1 ring-pink-500/40"
                            : "border-border-theme bg-background/50 hover:border-pink-500/40 hover:bg-hover-theme"
                        }`}
                      >
                        <div>
                          {/* Gradient Bar Preview */}
                          <div
                            className={`h-2.5 w-full rounded-full bg-gradient-to-r ${preset.previewGradient} mb-3 shadow-xs`}
                          />
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-sm text-foreground leading-tight">{preset.name}</span>
                            {isSelected ? (
                              <CheckCircle2 className="h-4 w-4 text-pink-500 shrink-0" />
                            ) : (
                              <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-background border border-border-theme text-slate-400">
                                {preset.category}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {preset.tagline}
                          </p>
                        </div>

                        {/* Color Swatch Dots */}
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-border-theme/40">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: preset.config.primaryColor }}
                              title={`Primary: ${preset.config.primaryColor}`}
                            />
                            <span
                              className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: preset.config.secondaryColor }}
                              title={`Secondary: ${preset.config.secondaryColor}`}
                            />
                            <span
                              className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: preset.config.brandBerry }}
                              title={`Brand Berry: ${preset.config.brandBerry}`}
                            />
                            <span
                              className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: preset.config.brandGold }}
                              title={`Brand Gold: ${preset.config.brandGold}`}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 group-hover:text-pink-500 font-bold transition">
                            Apply & Preview →
                          </span>
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
      )}
    </div>
  );
}
