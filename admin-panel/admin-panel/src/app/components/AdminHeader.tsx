"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Moon,
  Sun,
  ExternalLink,
  ShieldCheck,
  ChefHat,
  ChevronDown,
  Check,
  UserCheck,
  Truck,
  Headphones,
  Search,
  Crown,
  Palette,
  Lock,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useTheme, ADMIN_COLOR_PRESETS } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import NotificationCenterDropdown from "./notifications/NotificationCenterDropdown";
import { getPageRoleInfo, ROLES_CONFIG } from "../utils/rbacConfig";

export default function AdminHeader() {
  const { openMobile } = useSidebar();
  const { theme, toggleTheme, adminColor, setAdminColorPreset } = useTheme();
  const { user } = useAuth();
  const pathname = usePathname() || "";
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const paletteMenuRef = useRef<HTMLDivElement>(null);

  const pageRoleInfo = getPageRoleInfo(pathname);
  const currentRoleId = (user?.role || "super_admin").toLowerCase();
  const currentRoleConfig = ROLES_CONFIG[currentRoleId] || ROLES_CONFIG.super_admin;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (paletteMenuRef.current && !paletteMenuRef.current.contains(event.target as Node)) {
        setShowPaletteMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = (path: string) => {
    if (path.includes("dashboard")) return "Dashboard Overview";
    if (path.includes("theme-customizer")) return "Theme & Branding Studio";
    if (path.includes("abandoned-carts")) return "Abandoned Cart Recovery";
    if (path.includes("delivery-fleet")) return "Delivery Fleet & Logistics";
    if (path.includes("audit-logs")) return "Security & Audit Logs";
    if (path.includes("kitchenBoard") || path.includes("/orders/board")) return "Kitchen Live Dispatch";
    if (path.includes("orders")) return "Orders Pipeline";
    if (path.includes("products")) return "Product Catalog";
    if (path.includes("inventory")) return "Stock & Inventory";
    if (path.includes("admins")) return "Admin Team & RBAC";
    if (path.includes("seo")) return "SEO Growth Suite";
    if (path.includes("crm")) return "Customer Relationships";
    if (path.includes("leads")) return "Leads & Shopper Funnel";
    return "GiftFestive Workspace";
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border-theme bg-card/90 backdrop-blur-md px-3 sm:px-6">
      {/* Left: Mobile hamburger & breadcrumb title with Page Assignment Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={openMobile}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-theme bg-background text-foreground transition hover:bg-hover-theme lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 font-extrabold text-sm border border-pink-500/20">
            GF
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-foreground tracking-tight truncate">
                {getPageTitle(pathname)}
              </h2>

              {/* Prominent Page Assignment Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition shadow-2xs ${pageRoleInfo.badgeColor}`}
                title={`Assigned Department: ${pageRoleInfo.department}\nAllowed Roles: ${pageRoleInfo.allowedRoles.join(", ")}\nDescription: ${pageRoleInfo.description}`}
              >
                <ShieldCheck className="h-3 w-3 shrink-0" />
                <span className="font-semibold text-[10px] uppercase tracking-wider opacity-75">Assigned To:</span>
                <span className="truncate max-w-[180px] sm:max-w-none">{pageRoleInfo.assignedTo}</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online</span>
              <span>•</span>
              <span className="font-medium text-slate-400">{pageRoleInfo.department}</span>
              <span>•</span>
              <span className="text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                {pageRoleInfo.description}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Assigned Staff Role Badge (Security Locked) */}
        <div
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-2xs select-none ${currentRoleConfig.badgeColor}`}
          title={`Active Role: ${currentRoleConfig.name}\nDepartment: ${user?.department || currentRoleConfig.department}\nSecurity: System assigned and locked by Super Administrator.`}
        >
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden lg:inline text-[11px] font-medium opacity-75">Role:</span>
          <span className="font-black text-xs">{currentRoleConfig.name}</span>
          <Lock className="h-3 w-3 opacity-60 ml-0.5" />
        </div>

        {/* Quick Link to Kitchen Board */}
        <Link
          href="/orders/board"
          className="hidden md:flex items-center gap-1.5 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-500 hover:bg-orange-500/20 transition"
          title="Open Kitchen Live Board"
        >
          <ChefHat className="h-3.5 w-3.5" />
          <span>Kitchen Live</span>
        </Link>

        {/* View Live Customer Website */}
        <a
          href="https://giftfestive.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition"
          title="Open Live Website (giftfestive.com) in New Tab"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Go Website</span>
        </a>

        {/* Notification Bell Dropdown */}
        <NotificationCenterDropdown />

        {/* Admin Theme Palette Switcher */}
        <div className="relative" ref={paletteMenuRef}>
          <button
            type="button"
            onClick={() => setShowPaletteMenu(!showPaletteMenu)}
            className="cursor-pointer relative flex h-10 w-10 items-center justify-center rounded-xl border border-border-theme bg-background text-foreground transition hover:bg-hover-theme"
            title="Change Admin Dashboard Color Theme"
            aria-label="Admin Theme Palette"
          >
            <Palette className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span
              className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-background shadow-xs transition-colors"
              style={{ backgroundColor: adminColor.primary }}
            />
          </button>

          {showPaletteMenu && (
            <div className="absolute right-0 top-12 z-50 w-72 rounded-3xl border border-border-theme bg-card/95 backdrop-blur-xl p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-border-theme mb-3">
                <div className="flex items-center gap-1.5">
                  <Palette className="h-4 w-4 text-pink-500" />
                  <h4 className="text-xs font-black text-foreground">Admin Theme Palette</h4>
                </div>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full text-white shadow-2xs"
                  style={{ background: adminColor.primaryGradient }}
                >
                  {adminColor.name.split(" ")[0]}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mb-3">
                Click to switch dashboard color palette:
              </p>

              {/* Preset Swatches Grid */}
              <div className="grid grid-cols-5 gap-2 mb-3">
                {ADMIN_COLOR_PRESETS.map((p) => {
                  const isSelected = adminColor.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setAdminColorPreset(p.id);
                        setShowPaletteMenu(false);
                      }}
                      className={`group relative flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all ${
                        isSelected
                          ? "border-pink-500 bg-pink-500/10 shadow-sm ring-2 ring-pink-500/30 scale-105"
                          : "border-border-theme hover:bg-hover-theme"
                      }`}
                      title={p.name}
                    >
                      <span
                        className="h-6 w-6 rounded-full shadow-xs transition-transform group-hover:scale-110 flex items-center justify-center"
                        style={{ background: p.primaryGradient }}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white stroke-[3]" />}
                      </span>
                      <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 mt-1 truncate max-w-full">
                        {p.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2.5 border-t border-border-theme flex items-center justify-between text-xs">
                <Link
                  href="/theme-customizer?tab=admin"
                  onClick={() => setShowPaletteMenu(false)}
                  className="text-[11px] font-bold text-primary hover:opacity-80 flex items-center gap-1 transition"
                >
                  <span>Full Theme Studio →</span>
                </Link>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="text-[11px] font-bold text-slate-500 hover:text-foreground flex items-center gap-1 transition"
                >
                  {theme === "dark" ? <Sun className="h-3 w-3 text-amber-400" /> : <Moon className="h-3 w-3" />}
                  <span>{theme === "dark" ? "Light" : "Dark"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Dark/Light) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-xl border border-border-theme bg-background text-foreground transition hover:bg-hover-theme"
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600" />
          )}
        </button>

        {/* Admin User Profile Pill */}
        <Link
          href="/admins"
          className="flex items-center gap-2 rounded-xl border border-border-theme bg-background/80 p-1.5 pr-3 hover:bg-hover-theme transition"
          title="View Admin Profile & RBAC Settings"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500 text-white font-black text-xs shadow-xs">
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-foreground leading-none truncate max-w-[100px]">
              {user?.name || "Super Admin"}
            </p>
            <p className="text-[9px] text-pink-500 font-extrabold uppercase tracking-wider mt-0.5">
              {currentRoleConfig?.name || user?.role || "Super Admin"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
