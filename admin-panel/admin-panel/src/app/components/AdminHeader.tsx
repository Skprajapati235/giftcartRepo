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
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useTheme, ADMIN_COLOR_PRESETS } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import NotificationCenterDropdown from "./notifications/NotificationCenterDropdown";
import { getPageRoleInfo, ROLES_CONFIG } from "../utils/rbacConfig";

interface RoleOption {
  id: string;
  name: string;
  department: string;
  icon: string;
  avatarColor: string;
  description: string;
}

const AVAILABLE_SIMULATION_ROLES: RoleOption[] = [
  {
    id: "super_admin",
    name: "Super Admin (Owner)",
    department: "Executive Management",
    icon: "👑",
    avatarColor: "bg-pink-500 text-white",
    description: "Full root control across all modules, theme studio, billing & security.",
  },
  {
    id: "kitchen_manager",
    name: "Kitchen Manager",
    department: "Bakery & Kitchen",
    icon: "👨‍🍳",
    avatarColor: "bg-orange-500 text-white",
    description: "Baking queues, cake weights, custom inscriptions, and dispatch board.",
  },
  {
    id: "delivery_coordinator",
    name: "Fleet Coordinator",
    department: "Logistics & Fleet",
    icon: "🛵",
    avatarColor: "bg-blue-500 text-white",
    description: "Assign riders, track dispatch in transit, and send WhatsApp route links.",
  },
  {
    id: "support_agent",
    name: "Support Agent",
    department: "Customer Support & Recovery",
    icon: "🎧",
    avatarColor: "bg-rose-500 text-white",
    description: "Abandoned checkout recovery, 15% discount coupons & customer tickets.",
  },
  {
    id: "seo_specialist",
    name: "SEO Specialist",
    department: "Growth & Search Marketing",
    icon: "📈",
    avatarColor: "bg-purple-500 text-white",
    description: "Brand storefront theme studio, meta tags, Google JSON-LD schema & promos.",
  },
];

export default function AdminHeader() {
  const { openMobile } = useSidebar();
  const { theme, toggleTheme, adminColor, setAdminColorPreset } = useTheme();
  const { user, switchRole } = useAuth();
  const pathname = usePathname() || "";
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const paletteMenuRef = useRef<HTMLDivElement>(null);

  const pageRoleInfo = getPageRoleInfo(pathname);
  const currentRoleId = (user?.role || "super_admin").toLowerCase();
  const currentRoleConfig = ROLES_CONFIG[currentRoleId] || ROLES_CONFIG.super_admin;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
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
        {/* Interactive Role Switcher / Simulator Dropdown */}
        <div className="relative" ref={roleMenuRef}>
          <button
            type="button"
            onClick={() => setShowRoleMenu((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl border border-pink-500/25 bg-pink-500/10 px-2.5 py-1.5 text-xs font-bold text-pink-500 hover:bg-pink-500/20 transition cursor-pointer"
            title="Simulate Role / Test Permissions"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden lg:inline text-[11px] font-medium text-pink-500/80">Role:</span>
            <span className="font-black text-xs">{currentRoleConfig?.name || "Super Admin"}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border-theme bg-card shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 border-b border-border-theme">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-foreground">Switch / Test Team Role</p>
                  <span className="text-[10px] font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                    RBAC Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Simulate any department role to test page assignments and 403 access control in real-time.
                </p>
              </div>

              <div className="p-1 space-y-1 mt-1 max-h-72 overflow-y-auto">
                {AVAILABLE_SIMULATION_ROLES.map((r) => {
                  const isCurrent = currentRoleId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        switchRole(r.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition cursor-pointer ${
                        isCurrent
                          ? "bg-pink-500/15 border border-pink-500/30 text-foreground"
                          : "hover:bg-hover-theme text-foreground"
                      }`}
                    >
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${r.avatarColor}`}>
                        <span>{r.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold leading-tight">{r.name}</p>
                          {isCurrent && <Check className="h-3.5 w-3.5 text-pink-500 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-pink-500 dark:text-pink-400 font-medium mt-0.5">
                          {r.department}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {r.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-border-theme bg-background/50 rounded-b-xl text-[10px] text-slate-400">
                🔒 In production, team members log in using their dedicated staff email credentials with locked roles.
              </div>
            </div>
          )}
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
