"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Clock,
  RefreshCw,
  X,
  MapPin,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import DecorationSidebar from "./DecorationSidebar";
import * as service from "@/app/services/adminService";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/app/context/ThemeContext";

export default function DecorationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showToast } = useToast();
  const { theme, toggleTheme, adminColor } = useTheme();
  const isDark = theme === "dark";

  const [currentTime, setCurrentTime] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [stats, setStats] = useState({
    todaySetups: 0,
    unpaidCount: 0,
    totalBookings: 0,
  });
  const [latestAlert, setLatestAlert] = useState<{
    id: string;
    text: string;
    time: string;
  } | null>(null);

  const prevBookingsCountRef = useRef<number | null>(null);

  // Web Audio API 2-Tone Chime
  const playChimeSound = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      playTone(659.25, 0, 0.4);
      playTone(830.61, 0.15, 0.6);
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  };

  // Real-time Telemetry Polling (every 14s)
  const pollTelemetry = async () => {
    try {
      const res = await service.getDecorationAnalytics();
      if (res?.success && res.data) {
        const d = res.data;
        const total = d.totalBookings || 0;
        const today = d.todayCount || 0;
        const unpaid = d.statusCounts?.["Pending"] || 0;

        setStats({
          todaySetups: today,
          unpaidCount: unpaid,
          totalBookings: total,
        });

        if (prevBookingsCountRef.current !== null && total > prevBookingsCountRef.current) {
          playChimeSound();
          const recent = d.recentBookings?.[0];
          const alertText = recent
            ? `New Faridabad Booking: ${recent.bookingId} for ${recent.hotelName || recent.venueType} (₹${recent.totalAmount})`
            : "New Faridabad Decoration Booking Received!";

          setLatestAlert({
            id: String(Date.now()),
            text: alertText,
            time: "Just now",
          });
          showToast(alertText, "success");
        }

        prevBookingsCountRef.current = total;
      }
    } catch (e) {
      console.warn("Telemetry poll error:", e);
    }
  };

  useEffect(() => {
    pollTelemetry();
    const interval = setInterval(pollTelemetry, 14000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // System Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }) +
          " • " +
          now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`flex h-screen overflow-hidden font-sans transition-colors ${
        isDark ? "bg-[#060913] text-[#f8fafc]" : "bg-[#f8fafc] text-[#0f172a]"
      }`}
    >
      {/* 1. DEDICATED THEME-AWARE SIDEBAR */}
      <DecorationSidebar
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        stats={stats}
      />

      {/* 2. MAIN WORKSPACE */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-colors ${
          isDark ? "bg-[#060913]" : "bg-[#f8fafc]"
        }`}
      >
        {/* TOP COMMAND HEADER */}
        <header
          className={`sticky top-0 z-20 backdrop-blur-md px-6 py-3.5 flex items-center justify-between gap-4 shadow-sm border-b transition-colors ${
            isDark
              ? "bg-[#090e1a]/95 border-[#1e293b] text-white"
              : "bg-white/95 border-[#e2e8f0] text-slate-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl border flex items-center gap-1.5 transition-colors"
              style={{
                backgroundColor: adminColor?.primary ? `${adminColor.primary}15` : "#ec489915",
                borderColor: adminColor?.primary ? `${adminColor.primary}35` : "#ec489935",
                color: adminColor?.primary || "#ec4899",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Faridabad Decoration Studio
            </span>
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isDark ? "bg-[#141c2e] text-slate-300" : "bg-slate-100 text-slate-600"
              }`}
            >
              <MapPin
                className="w-3 h-3"
                style={{ color: adminColor?.primary || "#ec4899" }}
              />
              Pilot City: Faridabad, Haryana
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Notification Indicator */}
            {latestAlert && (
              <div
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold animate-pulse"
                style={{
                  backgroundColor: adminColor?.primary ? `${adminColor.primary}15` : "#ec489915",
                  borderColor: adminColor?.primary ? `${adminColor.primary}40` : "#ec489940",
                  color: adminColor?.primary || "#ec4899",
                }}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{latestAlert.text}</span>
                <button
                  onClick={() => setLatestAlert(null)}
                  className="hover:opacity-75 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Current Clock */}
            {currentTime && (
              <div
                className={`hidden lg:flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-xl ${
                  isDark ? "bg-[#141c2e] text-slate-300" : "bg-slate-100 text-slate-600"
                }`}
              >
                <Clock
                  className="w-3.5 h-3.5"
                  style={{ color: adminColor?.primary || "#ec4899" }}
                />
                <span>{currentTime}</span>
              </div>
            )}

            {/* SUPER ADMIN THEME TOGGLE (DARK / LIGHT) */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition border ${
                isDark
                  ? "bg-[#141c2e] text-amber-400 border-[#1e293b] hover:bg-[#1a243a]"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={pollTelemetry}
              className={`p-2 rounded-xl transition border ${
                isDark
                  ? "bg-[#141c2e] text-slate-300 border-[#1e293b] hover:bg-[#1a243a]"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
              title="Refresh Faridabad Telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* WORKSPACE CHILDREN VIEW */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
