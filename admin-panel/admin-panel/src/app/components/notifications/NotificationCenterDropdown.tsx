"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Volume2,
  VolumeX,
  Package,
  Moon,
  AlertTriangle,
  LifeBuoy,
  Check,
  CheckCheck,
  Sparkles,
  ExternalLink,
  Trash2,
  Send,
} from "lucide-react";
import { useLiveNotifications, LiveNotification } from "../../context/LiveNotificationContext";

export default function NotificationCenterDropdown() {
  const {
    notifications,
    unreadCount,
    isMuted,
    pushPermission,
    toggleMute,
    requestPushPermission,
    markAsRead,
    markAllAsRead,
    clearAll,
    triggerTestOrder,
  } = useLiveNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "order" | "midnight" | "stock">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredList = notifications.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  const getIcon = (type: LiveNotification["type"]) => {
    switch (type) {
      case "midnight":
        return <Moon className="h-4 w-4 text-purple-400" />;
      case "stock":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "support":
        return <LifeBuoy className="h-4 w-4 text-cyan-400" />;
      case "order":
      default:
        return <Package className="h-4 w-4 text-pink-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border-theme bg-background text-foreground transition-all hover:bg-hover-theme active:scale-95"
        title="Live Order Alerts & Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 text-[10px] font-black text-white items-center justify-center shadow-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-3xl border border-border-theme bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border-theme flex items-center justify-between bg-card">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
                <Bell className="h-3.5 w-3.5" />
              </span>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">Live Notifications</h4>
                <p className="text-[10px] text-slate-400">Real-time store & midnight alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                  isMuted
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                    : "border-border-theme bg-background text-emerald-500"
                }`}
                title={isMuted ? "Sound is Muted (Click to enable)" : "Sound is Active"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              {/* Push Permission Prompt */}
              {pushPermission !== "granted" && (
                <button
                  type="button"
                  onClick={requestPushPermission}
                  className="rounded-lg bg-pink-500/10 border border-pink-500/30 px-2 py-1 text-[10px] font-bold text-pink-500 hover:bg-pink-500 hover:text-white transition"
                  title="Enable Browser Push Notifications"
                >
                  Enable Push
                </button>
              )}
            </div>
          </div>

          {/* Test Order Trigger Button Bar */}
          <div className="px-4 py-2 bg-pink-500/5 border-b border-border-theme/60 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Test sound & alert:</span>
            <button
              type="button"
              onClick={triggerTestOrder}
              className="flex items-center gap-1 rounded-lg bg-pink-500 text-white px-2.5 py-1 text-[10px] font-bold shadow-xs hover:bg-pink-600 active:scale-95 transition"
            >
              <Sparkles className="h-3 w-3" />
              <span>Simulate Order</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-border-theme bg-background/50">
            {(
              [
                { id: "all", label: "All" },
                { id: "order", label: "Orders" },
                { id: "midnight", label: "Midnight 🌙" },
                { id: "stock", label: "Stock" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`flex-1 rounded-lg py-1 text-[11px] font-bold transition ${
                  filter === tab.id
                    ? "bg-card text-foreground shadow-2xs border border-border-theme"
                    : "text-slate-500 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications Feed */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border-theme/40 p-2 space-y-1">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No alerts in this category
              </div>
            ) : (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`group relative flex items-start gap-3 rounded-2xl p-3 transition cursor-pointer ${
                    item.read
                      ? "hover:bg-hover-theme/60 opacity-80"
                      : "bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/10"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                      item.type === "midnight"
                        ? "border-purple-500/30 bg-purple-500/10"
                        : item.type === "stock"
                        ? "border-amber-500/30 bg-amber-500/10"
                        : "border-pink-500/30 bg-pink-500/10"
                    }`}
                  >
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-foreground truncate">{item.title}</p>
                      <span className="text-[9px] text-slate-400 shrink-0">{item.timestamp}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {item.message}
                    </p>

                    {item.amount && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                          ₹{item.amount}
                        </span>
                        {item.customer && (
                          <span className="text-[10px] text-slate-400 truncate">
                            by {item.customer}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!item.read && (
                    <span className="h-2 w-2 rounded-full bg-pink-500 shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border-theme flex items-center justify-between bg-card text-xs">
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-foreground transition"
            >
              <CheckCheck className="h-3.5 w-3.5 text-pink-500" />
              <span>Mark all read</span>
            </button>

            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-rose-500 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
