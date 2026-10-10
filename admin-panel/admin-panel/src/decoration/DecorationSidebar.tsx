"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  Package,
  Camera,
  Store,
  Receipt,
  ArrowLeft,
  Volume2,
  VolumeX,
  X,
  ChevronRight,
  ChevronsLeft,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

interface Props {
  soundEnabled: boolean;
  onToggleSound: () => void;
  stats?: {
    todaySetups?: number;
    unpaidCount?: number;
    totalBookings?: number;
  };
}

interface SubItem {
  href: string;
  label: string;
  icon: any;
  badge?: string | number;
  badgeColor?: string;
  description?: string;
}

interface RailItem {
  key: string;
  label: string;
  shortLabel?: string;
  href?: string;
  icon: any;
  badge?: string | number;
  children?: SubItem[];
}

export default function DecorationSidebar({
  soundEnabled,
  onToggleSound,
  stats,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, adminColor } = useTheme();
  const isDark = theme === "dark";

  // RAIL NAVIGATION ITEMS (Icon on top, name underneath)
  const RAIL_ITEMS: RailItem[] = useMemo(
    () => [
      {
        key: "overview",
        label: "Overview",
        shortLabel: "Overview",
        href: "/decoration-panel",
        icon: LayoutDashboard,
      },
      {
        key: "bookings",
        label: "Bookings",
        shortLabel: "Bookings",
        icon: CalendarCheck,
        badge: stats?.unpaidCount ? stats.unpaidCount : undefined,
        children: [
          {
            href: "/decoration-panel/bookings",
            label: "All Bookings",
            icon: CalendarCheck,
            badge: stats?.totalBookings ? stats.totalBookings : undefined,
            description: "Live setups pipeline",
          },
          {
            href: "/decoration-panel/payments",
            label: "Payments",
            icon: CreditCard,
            badge: stats?.unpaidCount ? `${stats.unpaidCount} Due` : undefined,
            badgeColor: isDark
              ? "bg-amber-500/15 text-amber-400"
              : "bg-amber-50 text-amber-700 border border-amber-200",
            description: "UPI, COD & recoveries",
          },
        ],
      },
      {
        key: "catalog",
        label: "Catalog",
        shortLabel: "Catalog",
        icon: Package,
        children: [
          {
            href: "/decoration-panel/packages",
            label: "Packages",
            icon: Package,
            description: "Setup packages & pricing",
          },
          {
            href: "/decoration-panel/samples",
            label: "Showcase",
            icon: Camera,
            description: "Real hotel setup photos",
          },
        ],
      },
      {
        key: "partners",
        label: "Partners",
        shortLabel: "Partners",
        icon: Store,
        children: [
          {
            href: "/decoration-panel/partners",
            label: "Decorator Partners",
            icon: Store,
            description: "Verified Faridabad decorators",
          },
        ],
      },
      {
        key: "ledger",
        label: "Ledger",
        shortLabel: "Ledger",
        icon: Receipt,
        children: [
          {
            href: "/decoration-panel/financials",
            label: "Profit & Payouts",
            icon: Receipt,
            description: "Commission & bills ledger",
          },
        ],
      },
    ],
    [stats, isDark]
  );

  const [selectedKey, setSelectedKey] = useState<string>("overview");
  const [subSidebarOpen, setSubSidebarOpen] = useState<boolean>(false);

  // Auto-detect active category from current URL
  useEffect(() => {
    for (const item of RAIL_ITEMS) {
      if (item.href && (pathname === item.href || (item.href === "/decoration-panel" && pathname === "/decoration"))) {
        setSelectedKey(item.key);
        setSubSidebarOpen(false);
        return;
      }
      if (item.children?.some((child) => pathname?.startsWith(child.href))) {
        setSelectedKey(item.key);
        setSubSidebarOpen(true);
        return;
      }
    }
  }, [pathname, RAIL_ITEMS]);

  const activeRailItem = useMemo(() => {
    return RAIL_ITEMS.find((item) => item.key === selectedKey);
  }, [RAIL_ITEMS, selectedKey]);

  const handleRailClick = (item: RailItem) => {
    if (item.children && item.children.length > 0) {
      if (selectedKey === item.key) {
        // Toggle sub-sidebar if same item is clicked
        setSubSidebarOpen((prev) => !prev);
      } else {
        setSelectedKey(item.key);
        setSubSidebarOpen(true);
      }
    } else if (item.href) {
      // Direct navigation without children
      setSelectedKey(item.key);
      setSubSidebarOpen(false);
      router.push(item.href);
    }
  };

  return (
    <div className="flex h-screen shrink-0 select-none relative z-30">
      {/* ─── 1. PRIMARY SLIM RAIL (SIRF ICON AUR USKE NICHE NAAM) ─── */}
      <aside
        className={`w-[80px] h-screen flex flex-col justify-between border-r transition-colors select-none ${
          isDark
            ? "bg-[#090e1a] text-slate-200 border-[#1e293b]"
            : "bg-white text-slate-800 border-slate-200"
        }`}
      >
        {/* Top Brand Logo */}
        <div
          className={`p-3 pb-2.5 flex flex-col items-center justify-center border-b transition-colors ${
            isDark ? "border-[#1e293b] bg-[#0d1322]/80" : "border-slate-100 bg-slate-50/70"
          }`}
        >
          <Link
            href="/decoration-panel"
            className="group flex flex-col items-center justify-center transition-transform hover:scale-105"
            title="Faridabad Decoration Studio"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm"
              style={{
                background:
                  adminColor?.primaryGradient ||
                  "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
              }}
            >
              GC
            </div>
            <span
              className="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase tracking-wider mt-1"
              style={{
                backgroundColor: adminColor?.primary ? `${adminColor.primary}18` : "#ec489918",
                color: adminColor?.primary || "#ec4899",
              }}
            >
              Decor
            </span>
          </Link>
        </div>

        {/* Middle Navigation Rail Items (Icon on top, Label underneath) */}
        <div className="flex-1 overflow-y-auto py-2.5 space-y-1.5 scrollbar-none px-1">
          {RAIL_ITEMS.map((item) => {
            const Icon = item.icon;
            const hasChildren = Boolean(item.children && item.children.length > 0);

            const isRouteActive = item.href
              ? pathname === item.href || (item.href === "/decoration-panel" && pathname === "/decoration")
              : item.children?.some((child) => pathname?.startsWith(child.href));

            const isSelected = selectedKey === item.key;
            const isHighlighted = isRouteActive || isSelected;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleRailClick(item)}
                className={`w-[70px] mx-auto py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all group relative cursor-pointer ${
                  isHighlighted
                    ? isDark
                      ? "bg-slate-800/90 text-white font-bold border border-slate-700 shadow-2xs"
                      : "bg-pink-50 text-pink-600 font-bold border border-pink-200/80 shadow-2xs"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-850 border border-transparent"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                }`}
                style={
                  isHighlighted && adminColor?.primary
                    ? {
                        backgroundColor: `${adminColor.primary}${isDark ? "22" : "12"}`,
                        color: adminColor.primary,
                        borderColor: `${adminColor.primary}35`,
                      }
                    : undefined
                }
                title={item.label}
              >
                {/* Left Active Indicator Notch */}
                {isHighlighted && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full shadow-xs"
                    style={{
                      backgroundColor: adminColor?.primary || "#ec4899",
                    }}
                  />
                )}

                {/* Top Icon */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-xl transition-transform group-hover:scale-105 ${
                    isHighlighted ? "text-current" : "text-slate-400 group-hover:text-current"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                </div>

                {/* Label Underneath Icon */}
                <span className="text-[10px] font-semibold text-center leading-tight truncate max-w-[66px] mt-0.5">
                  {item.shortLabel || item.label}
                </span>

                {/* Small indicator dot on corner if it has children and sub-sidebar is open */}
                {hasChildren && isSelected && subSidebarOpen && (
                  <span
                    className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: adminColor?.primary || "#ec4899" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Rail Utility Controls (Sound, Theme, Exit) */}
        <div
          className={`p-2 border-t flex flex-col items-center gap-2 shrink-0 transition-colors ${
            isDark ? "border-[#1e293b] bg-[#0d1322]/50" : "border-slate-100 bg-slate-50/50"
          }`}
        >
          {/* Sound / Chime Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`cursor-pointer flex h-8 w-8 items-center justify-center rounded-xl border transition hover:scale-105 ${
              soundEnabled
                ? isDark
                  ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                  : "border-emerald-200 text-emerald-600 bg-emerald-50"
                : isDark
                ? "border-slate-800 text-slate-500 bg-slate-900"
                : "border-slate-200 text-slate-400 bg-white"
            }`}
            title={soundEnabled ? "Booking alerts sound enabled" : "Booking alerts muted"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`cursor-pointer flex h-8 w-8 items-center justify-center rounded-xl border transition hover:scale-105 ${
              isDark
                ? "border-slate-800 bg-slate-900 text-amber-400"
                : "border-slate-200 bg-white text-indigo-500"
            }`}
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Exit Back to Main Admin */}
          <Link
            href="/dashboard"
            className={`w-[70px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-center text-center transition group border ${
              isDark
                ? "border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Return to Main Admin Panel"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[9px] font-bold mt-0.5">Exit</span>
          </Link>
        </div>
      </aside>

      {/* ─── 2. SECONDARY SUB-SIDEBAR (OPENS ON CLICKING ITEM WITH CHILDREN) ─── */}
      {activeRailItem && activeRailItem.children && subSidebarOpen && (
        <aside
          className={`w-64 h-screen flex flex-col border-r transition-colors select-none animate-in slide-in-from-left-2 duration-150 shadow-md ${
            isDark
              ? "bg-[#0d1322] text-slate-200 border-[#1e293b]"
              : "bg-white text-slate-800 border-slate-200"
          }`}
        >
          {/* Sub-Sidebar Header */}
          <div
            className={`p-3.5 border-b flex items-center justify-between shrink-0 transition-colors ${
              isDark ? "border-[#1e293b] bg-[#090e1a]/60" : "border-slate-100 bg-slate-50/60"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: adminColor?.primary ? `${adminColor.primary}18` : "#ec489918",
                  borderColor: adminColor?.primary ? `${adminColor.primary}30` : "#ec489930",
                  color: adminColor?.primary || "#ec4899",
                }}
              >
                <activeRailItem.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-black uppercase tracking-wider truncate">
                  {activeRailItem.label}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {activeRailItem.children.length} Pages
                </p>
              </div>
            </div>

            {/* Collapse Sub-Sidebar Button */}
            <button
              type="button"
              onClick={() => setSubSidebarOpen(false)}
              className="cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Close sub-sidebar"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-Sidebar Child Links List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin">
            {activeRailItem.children.map((child) => {
              const childActive = pathname === child.href || pathname?.startsWith(child.href + "/");
              const ChildIcon = child.icon;

              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`cursor-pointer group flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-xs transition-all ${
                    childActive
                      ? "text-white font-bold shadow-xs"
                      : isDark
                      ? "text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
                  }`}
                  style={
                    childActive
                      ? {
                          backgroundColor: adminColor?.primary || "#ec4899",
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ChildIcon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        childActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-current"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="truncate">{child.label}</p>
                      {child.description && (
                        <p
                          className={`text-[9.5px] truncate ${
                            childActive ? "text-white/80" : "text-slate-400"
                          }`}
                        >
                          {child.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {child.badge !== undefined && (
                      <span
                        className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-bold ${
                          childActive
                            ? "bg-white/20 text-white"
                            : child.badgeColor ||
                              (isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600")
                        }`}
                      >
                        {child.badge}
                      </span>
                    )}
                    {childActive && (
                      <ChevronRight className="h-3.5 w-3.5 text-white/90" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Sub-Sidebar Footer */}
          <div
            className={`p-3 border-t text-[10px] text-slate-400 flex items-center justify-between ${
              isDark ? "border-[#1e293b] bg-[#090e1a]/40" : "border-slate-100 bg-slate-50/40"
            }`}
          >
            <span>Faridabad Pilot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </aside>
      )}
    </div>
  );
}
