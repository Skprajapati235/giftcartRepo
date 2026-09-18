"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Moon,
  Sun,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
  Eye,
  Info,
  Package,
} from "lucide-react";
import {
  DeliveryHoursStatus,
  getDeliveryHours,
  updateDeliveryHours,
} from "../../services/deliveryHoursService";
import { useToast } from "../../../context/ToastContext";

export default function DeliveryHoursSettings() {
  const { showToast } = useToast();

  const [settings, setSettings] = useState<DeliveryHoursStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Form state
  const [isRestricted, setIsRestricted] = useState<boolean>(false);
  const [dailyStart, setDailyStart] = useState<string>("23:00");
  const [dailyEnd, setDailyEnd] = useState<string>("07:00");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [blockOrders, setBlockOrders] = useState<boolean>(true);

  // Load initial settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getDeliveryHours();
      setSettings(data);
      setIsRestricted(data.isRestricted);
      setDailyStart(data.dailyStart || "23:00");
      setDailyEnd(data.dailyEnd || "07:00");
      setCustomMessage(
        data.message && data.message !== "Delivery is operating normally."
          ? data.message
          : "Night delivery is currently paused. Available for delivery after 7:00 AM."
      );
      setBlockOrders(data.blockOrders !== undefined ? data.blockOrders : true);
    } catch (error) {
      console.error("Error fetching delivery hours:", error);
      showToast("Failed to load delivery settings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateDeliveryHours({
        isRestricted,
        dailyStart,
        dailyEnd,
        customMessage,
        blockOrders,
      });
      setSettings(updated);
      showToast("Delivery operating hours saved successfully!", "success");
    } catch (error) {
      console.error("Error saving delivery hours:", error);
      showToast("Failed to update delivery settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-3xl bg-card border border-border-theme" />
        <div className="h-96 rounded-3xl bg-card border border-border-theme" />
      </div>
    );
  }

  const isCurrentlyClosed = settings?.isCurrentlyRestricted;

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Delivery Operating Hours & Night Restriction
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
              Control when deliveries are paused at night. During closed hours, products stay visible but orders are paused with an unavailable notice.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Status Card */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm transition-all ${
          !isRestricted
            ? "border-slate-200 dark:border-slate-800 bg-card"
            : isCurrentlyClosed
            ? "border-rose-500/30 bg-rose-500/5"
            : "border-emerald-500/30 bg-emerald-500/5"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`rounded-2xl p-3.5 ${
                !isRestricted
                  ? "bg-slate-100 text-slate-500 dark:bg-slate-800"
                  : isCurrentlyClosed
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {!isRestricted ? (
                <Sun className="h-7 w-7" />
              ) : isCurrentlyClosed ? (
                <Moon className="h-7 w-7" />
              ) : (
                <CheckCircle2 className="h-7 w-7" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Current Store Status
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    !isRestricted
                      ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      : isCurrentlyClosed
                      ? "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                      : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      !isRestricted
                        ? "bg-slate-400"
                        : isCurrentlyClosed
                        ? "bg-rose-500 animate-pulse"
                        : "bg-emerald-500 animate-pulse"
                    }`}
                  />
                  {!isRestricted
                    ? "24/7 Ordering Enabled (Restriction Off)"
                    : isCurrentlyClosed
                    ? "🌙 Night Delivery Paused (Currently Closed)"
                    : "🟢 Open for Deliveries (Accepting Orders)"}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {!isRestricted
                  ? "Customers can place orders anytime without time restrictions."
                  : isCurrentlyClosed
                  ? `Night deliveries paused. Next delivery slot: ${settings?.nextAvailableTime || "7:00 AM"}`
                  : `Store is currently accepting orders. Daily pause starts at ${dailyStart}.`}
              </h3>

              {isRestricted && (
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                  Configured Window: Daily pause from{" "}
                  <strong className="text-slate-900 dark:text-white font-mono">{dailyStart}</strong> to{" "}
                  <strong className="text-slate-900 dark:text-white font-mono">{dailyEnd}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Form & Side Preview Grid */}
      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-12">
        {/* Left Form Settings (8 Columns) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 rounded-3xl border border-border-theme bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-5 border-b border-border-theme">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Night Delivery Restriction Settings
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Set the exact times when deliveries stop and resume each day.
                </p>
              </div>

              {/* Master Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRestricted}
                  onChange={(e) => setIsRestricted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Time Inputs */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Pause Start Time */}
              <div className="rounded-2xl border border-border-theme bg-background p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Moon className="h-4 w-4 text-primary" />
                    <span>Stop Deliveries / Pause Orders At</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">
                    (24h format)
                  </span>
                </div>
                <input
                  type="time"
                  required
                  value={dailyStart}
                  onChange={(e) => setDailyStart(e.target.value)}
                  className="w-full rounded-xl border border-border-theme bg-card px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
                <p className="text-[12px] text-slate-700 dark:text-slate-300 font-medium">
                  Default: 23:00 (11:00 PM). Orders are stopped starting from this time.
                </p>
              </div>

              {/* Resume Time */}
              <div className="rounded-2xl border border-border-theme bg-background p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span>Resume Deliveries / Open Orders At</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">
                    (24h format)
                  </span>
                </div>
                <input
                  type="time"
                  required
                  value={dailyEnd}
                  onChange={(e) => setDailyEnd(e.target.value)}
                  className="w-full rounded-xl border border-border-theme bg-card px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
                <p className="text-[12px] text-slate-700 dark:text-slate-300 font-medium">
                  Default: 07:00 (07:00 AM). Delivery services reopen from this time.
                </p>
              </div>
            </div>

            {/* Announcement Message */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                Custom Unavailable Message Shown on Product Cards & Checkout:
              </label>
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="e.g. Night delivery is currently paused. Available for delivery after 7:00 AM."
                className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
              <p className="text-[12px] text-slate-700 dark:text-slate-300 font-medium">
                This message appears when customers hover over product cards and when viewing product details.
              </p>
            </div>

            {/* Block Orders Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="blockOrders"
                checked={blockOrders}
                onChange={(e) => setBlockOrders(e.target.checked)}
                className="h-4 w-4 rounded border-border-theme text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="blockOrders" className="text-xs font-semibold text-slate-900 dark:text-slate-200 cursor-pointer">
                Strictly block order placement during paused hours (Reject checkout attempts via API)
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-5 mt-6 border-t border-border-theme">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-primary text-white px-8 py-3 text-sm font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Delivery Settings</span>
            </button>
          </div>
        </div>

        {/* Right Preview & Info Cards (4-5 Columns) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Live Simulation Preview Card */}
          <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Eye className="h-4 w-4 text-primary" />
              <span>Customer Product Card Hover Preview</span>
            </div>

            <div className="relative w-full rounded-2xl border border-border-theme bg-background p-4 shadow-sm overflow-hidden group">
              <div className="h-44 w-full rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3 relative overflow-hidden">
                <Package className="h-12 w-12" />

                {/* Simulation Overlay */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center transition-all duration-300">
                  <span className="rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5" />
                    Currently Unavailable
                  </span>
                  <p className="text-xs font-bold text-white leading-relaxed">
                    Available for delivery after {settings?.formattedEnd || "7:00 AM"}
                  </p>
                </div>
              </div>

              <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                Fresh Rose Bouquet 🌸
              </div>
              <div className="text-xs text-primary font-black mt-1">₹499</div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              When night restriction is active, product catalog stays accessible. Hovering shows this unavailable prompt to users.
            </p>
          </div>

          {/* Operating Info Card */}
          <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Info className="h-4 w-4 text-primary" />
              <span>Operating Guidelines</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong className="text-slate-900 dark:text-white">Catalog Browsing:</strong> Remains active 24/7 so customers can browse gifts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong className="text-slate-900 dark:text-white">Checkout Block:</strong> Placing orders is cleanly rejected with an explanatory notification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong className="text-slate-900 dark:text-white">Auto-Resume:</strong> Store reopens automatically once the morning resume time is reached.</span>
              </li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
