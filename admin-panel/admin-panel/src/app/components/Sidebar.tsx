"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo, useRef, type ElementType } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { canAccessPage } from "../utils/rbacConfig";
import {
  Home,
  Bot,
  Box,
  ShoppingCart,
  Tag,
  Users,
  Settings,
  CreditCard,
  MapPin,
  Star,
  Gift,
  Pipette,
  PartyPopper,
  FileText,
  Phone,
  Boxes,
  Clock,
  LifeBuoy,
  Mail,
  Lightbulb,
  UserPlus,
  SlidersHorizontal,
  Globe,
  ArrowRightLeft,
  Activity,
  MessageSquareQuote,
  Images,
  Code,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChefHat,
  Palette,
  Truck,
} from "lucide-react";

export type NavSubItem = {
  key: string;
  label: string;
  href: string;
  icon?: ElementType;
  badge?: string;
  description?: string;
  color?: string;
};

export type NavItemConfig = {
  key: string;
  label: string;
  href?: string;
  icon: ElementType;
  badge?: string;
  badgeVariant?: "neon-cyan" | "neon-purple" | "neon-emerald" | "neon-amber";
  accentColor?: string;
  children?: NavSubItem[];
};

export type NavSectionConfig = {
  sectionTitle: string;
  dotColor: string;
  items: NavItemConfig[];
};

export const linearSidebarNav: NavSectionConfig[] = [
  {
    sectionTitle: "Workspace",
    dotColor: "bg-blue-400",
    items: [
      {
        key: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
      {
        key: "chat",
        label: "AI Assistant",
        href: "/chat",
        icon: Bot,
        badge: "AI 2.0",
        badgeVariant: "neon-purple",
      },
    ],
  },
  {
    sectionTitle: "Catalog & Store",
    dotColor: "bg-amber-400",
    items: [
      {
        key: "catalog",
        label: "Catalog",
        icon: Box,
        children: [
          { key: "products", label: "Products", href: "/products", icon: Box, description: "Catalog inventory items", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", badge: "Kitchen" },
          { key: "category", label: "Categories", href: "/category", icon: Tag, description: "Store taxonomy & groups", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
          { key: "flavors", label: "Flavors", href: "/flavors", icon: Pipette, description: "Taste & cake variants", color: "text-pink-500 bg-pink-500/10 border-pink-500/20", badge: "Kitchen" },
          { key: "addons", label: "Gifting Add-ons", href: "/addons", icon: Gift, description: "Candles, cards & celebration upsells", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", badge: "New" },
          { key: "cities", label: "Delivery Cities", href: "/cities", icon: MapPin, description: "Pin-code & zones", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
          { key: "offers", label: "Offers & Coupons", href: "/coupons", icon: Gift, description: "Promo codes & discounts", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", badge: "Growth" },
          { key: "gallery", label: "Media Gallery", href: "/gallery", icon: Images, description: "Image asset storage", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
        ],
      },
    ],
  },
  {
    sectionTitle: "Sales & Orders",
    dotColor: "bg-emerald-400",
    items: [
      {
        key: "order-mgmt",
        label: "Orders & Reviews",
        icon: ShoppingCart,
        children: [
          { key: "orders", label: "Orders Pipeline", href: "/orders", icon: ShoppingCart, description: "Live customer orders", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", badge: "Sales" },
          { key: "kitchenBoard", label: "Kitchen Live Board", href: "/orders/board", icon: ChefHat, description: "Real-time kitchen order dispatch", color: "text-orange-500 bg-orange-500/10 border-orange-500/20", badge: "Kitchen" },
          { key: "abandonedCarts", label: "Abandoned Carts", href: "/abandoned-carts", icon: ShoppingCart, description: "Automated WhatsApp recovery", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", badge: "Support" },
          { key: "deliveryFleet", label: "Delivery Fleet", href: "/delivery-fleet", icon: Truck, description: "Rider dispatch & logistics", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", badge: "Fleet" },
          { key: "reviews", label: "Customer Reviews", href: "/reviews", icon: Star, description: "Product feedback & ratings", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
          { key: "testimonials", label: "Testimonials", href: "/testimonials", icon: MessageSquareQuote, description: "Curated store testimonials", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
        ],
      },
      {
        key: "inventory-mgmt",
        label: "Inventory & Billing",
        icon: Boxes,
        children: [
          { key: "inventory", label: "Stock Inventory", href: "/inventory", icon: Boxes, description: "Warehouse quantities", color: "text-sky-500 bg-sky-500/10 border-sky-500/20", badge: "Kitchen" },
          { key: "payments", label: "Payments & Txns", href: "/payments", icon: CreditCard, description: "Gateway settlements", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", badge: "Admin" },
        ],
      },
    ],
  },
  {
    sectionTitle: "Growth & SEO",
    dotColor: "bg-cyan-400",
    items: [
      { key: "users", label: "User Directory", href: "/users", icon: Users, badge: "CRM" },
      {
        key: "seo",
        label: "SEO Suite",
        icon: Globe,
        badge: "Growth",
        badgeVariant: "neon-cyan",
        children: [
          { key: "seo-global", label: "Global & Schema", href: "/seo/global", icon: Settings, description: "JSON-LD & OpenGraph", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20", badge: "SEO" },
          { key: "seo-pages", label: "Page-by-Page SEO", href: "/seo/pages", icon: FileText, description: "On-page metadata", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", badge: "SEO" },
          { key: "seo-redirects", label: "URL Redirects", href: "/seo/redirects", icon: ArrowRightLeft, description: "301 & 302 rules", color: "text-violet-500 bg-violet-500/10 border-violet-500/20", badge: "SEO" },
          { key: "seo-robots", label: "Robots & Sitemap", href: "/seo/robots-sitemap", icon: Bot, description: "XML sitemap generation", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", badge: "SEO" },
          { key: "seo-audit", label: "SEO Health Audit", href: "/seo/audit", icon: Activity, description: "Score & error checker", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", badge: "SEO" },
        ],
      },
      {
        key: "insight",
        label: "Lead Insights & CRM",
        icon: Lightbulb,
        children: [
          { key: "leads", label: "Leads Funnel", href: "/leads", icon: UserPlus, description: "Captured shopper inquiries", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", badge: "Support" },
          { key: "crm", label: "CRM Directory", href: "/crm", icon: Users, description: "Customer relationships", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20", badge: "Support" },
        ],
      },
      {
        key: "contact",
        label: "Inquiries & Support",
        icon: Phone,
        children: [
          { key: "websiteContacts", label: "Website Contacts", href: "/websitecontact", icon: Mail, description: "Contact form leads", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", badge: "Support" },
          { key: "customerSupport", label: "Support Tickets", href: "/support", icon: LifeBuoy, description: "Customer issues", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20", badge: "Support" },
        ],
      },
    ],
  },
  {
    sectionTitle: "Store Setup & System",
    dotColor: "bg-purple-400",
    items: [
      {
        key: "store-setup",
        label: "Storefront Config",
        icon: SlidersHorizontal,
        children: [
          { key: "themeStudio", label: "Theme & Branding Studio", href: "/theme-customizer", icon: Palette, description: "Admin panel & storefront themes", color: "text-pink-500 bg-pink-500/10 border-pink-500/20", badge: "Super Admin" },
          { key: "deliverySlots", label: "Delivery Slots", href: "/delivery-slots", icon: Clock, description: "Midnight & express slot rules", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20", badge: "Fleet" },
          { key: "stories", label: "Story Highlights", href: "/stories", icon: Sparkles, description: "Instagram-style reels & banner stories", color: "text-pink-500 bg-pink-500/10 border-pink-500/20", badge: "Marketing" },
          { key: "heroSlides", label: "Hero Slides", href: "/hero-slides", icon: SlidersHorizontal, description: "Banner promotional carousels", color: "text-purple-500 bg-purple-500/10 border-purple-500/20", badge: "Marketing" },
          { key: "occasions", label: "Occasions", href: "/occasions", icon: PartyPopper, description: "Events & gifting tags", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
          { key: "deliveryHours", label: "Operating Hours", href: "/delivery-hours", icon: Clock, description: "Delivery cutoff slots", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", badge: "Fleet" },
        ],
      },
      {
        key: "admin-system",
        label: "Administration",
        icon: Settings,
        children: [
          { key: "adminProfile", label: "Admin Profiles & RBAC", href: "/admins", icon: Users, description: "Team accounts & roles matrix", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", badge: "Super Admin" },
          { key: "auditLogs", label: "Security & Activity Logs", href: "/audit-logs", icon: ShieldCheck, description: "Immutable activity audit trail, live telemetry & API exports", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", badge: "Super Admin" },
          { key: "developer", label: "Developer API & Logs", href: "/developer", icon: Code, description: "Webhooks & server logs", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", badge: "Dev" },
          { key: "termsPolicy", label: "Terms & Privacy Policy", href: "/terms", icon: FileText, description: "Legal compliance pages", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
        ],
      },
    ],
  },
];

function checkChildActive(pathname: string | null, childHref: string, allSiblings?: NavSubItem[]): boolean {
  if (!pathname) return false;
  if (pathname === childHref) return true;
  if (pathname.startsWith(childHref + "/")) {
    if (allSiblings) {
      const hasMoreSpecificMatch = allSiblings.some(
        (sib) =>
          sib.href !== childHref &&
          sib.href.startsWith(childHref) &&
          (pathname === sib.href || pathname.startsWith(sib.href + "/"))
      );
      if (hasMoreSpecificMatch) return false;
    }
    return true;
  }
  return false;
}

function isItemActive(pathname: string | null, href?: string, children?: NavSubItem[]): boolean {
  if (!pathname) return false;
  if (href) {
    if (pathname === href) return true;
    if (href !== "/" && pathname.startsWith(href + "/")) return true;
  }
  if (children) {
    return children.some((c) => checkChildActive(pathname, c.href, children));
  }
  return false;
}

function useFilteredNav(user: any): NavSectionConfig[] {
  return useMemo(() => {
    const role = user?.role;
    const permissions = user?.permissions;

    // Super Admin has full unrestricted root access to all navigation modules
    if (role === "super_admin" || role === "admin") {
      return linearSidebarNav;
    }

    return linearSidebarNav
      .map((section) => {
        const filteredItems = section.items
          .map((item) => {
            // If item has children, filter individual child links strictly
            if (item.children && item.children.length > 0) {
              const allowedChildren = item.children.filter((child) =>
                canAccessPage(role, child.href, permissions)
              );
              if (allowedChildren.length === 0) {
                return null;
              }
              return {
                ...item,
                children: allowedChildren,
              };
            }

            // If item has a direct single href link
            if (item.href) {
              if (canAccessPage(role, item.href, permissions)) {
                return item;
              }
              return null;
            }

            return null;
          })
          .filter(Boolean) as NavItemConfig[];

        if (filteredItems.length === 0) {
          return null;
        }

        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter(Boolean) as NavSectionConfig[];
  }, [user?.role, user?.permissions]);
}

function DesktopSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const filteredNav = useFilteredNav(user);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Single active open group to prevent excessive vertical height
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Floating flyout menu state for collapsed rail mode
  const [flyoutMenu, setFlyoutMenu] = useState<{
    item: NavItemConfig;
    top: number;
    isPinned?: boolean;
  } | null>(null);
  const flyoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);

  // Auto-expand the accordion group containing the active page
  useEffect(() => {
    filteredNav.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children?.some((child) => checkChildActive(pathname, child.href, item.children))) {
          setOpenGroup(item.key);
        }
      });
    });
  }, [pathname, filteredNav]);

  // Accordion toggle: closes other groups to keep sidebar compact without scrolling
  const toggleAccordion = (key: string) => {
    setOpenGroup((prev) => (prev === key ? null : key));
  };

  // Close flyout on outside pointer down, preserving clicks on trigger buttons
  useEffect(() => {
    if (!flyoutMenu) return;
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (flyoutRef.current && flyoutRef.current.contains(target as Node)) {
        return;
      }
      if (target?.closest('[data-sidebar-trigger]')) {
        return;
      }
      setFlyoutMenu(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [flyoutMenu]);

  // Flyout handlers for collapsed rail mode with smooth bridge
  const handleCollapsedItemEnter = (item: NavItemConfig, e: React.MouseEvent<HTMLElement>) => {
    if (!isCollapsed || !item.children || item.children.length === 0) return;
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const calculatedTop = Math.max(16, Math.min(rect.top - 6, window.innerHeight - 380));
    setFlyoutMenu((prev) => {
      if (prev?.isPinned && prev.item.key === item.key) return prev;
      return { item, top: calculatedTop, isPinned: prev?.item.key === item.key ? prev.isPinned : false };
    });
  };

  const handleCollapsedItemLeave = () => {
    if (flyoutMenu?.isPinned) return; // If pinned by click, never close on hover leave!
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
    flyoutTimerRef.current = setTimeout(() => {
      setFlyoutMenu((prev) => (prev?.isPinned ? prev : null));
    }, 600); // Generous 600ms bridge period so submenu doesn't vanish
  };

  const handleFlyoutMouseEnter = () => {
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
  };

  const handleFlyoutMouseLeave = () => {
    if (flyoutMenu?.isPinned) return;
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
    flyoutTimerRef.current = setTimeout(() => {
      setFlyoutMenu((prev) => (prev?.isPinned ? prev : null));
    }, 450);
  };

  // Real-time search filter across all accessible navigation
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    const results: { sectionTitle: string; item: NavSubItem }[] = [];

    filteredNav.forEach((section) => {
      section.items.forEach((item) => {
        if (item.href && (item.label.toLowerCase().includes(q) || item.key.toLowerCase().includes(q))) {
          results.push({
            sectionTitle: section.sectionTitle,
            item: { key: item.key, label: item.label, href: item.href, icon: item.icon },
          });
        }
        item.children?.forEach((child) => {
          if (
            child.label.toLowerCase().includes(q) ||
            child.key.toLowerCase().includes(q) ||
            child.description?.toLowerCase().includes(q)
          ) {
            results.push({
              sectionTitle: `${section.sectionTitle} › ${item.label}`,
              item: child,
            });
          }
        });
      });
    });

    return results;
  }, [searchQuery, filteredNav]);

  return (
    <div className="hidden h-screen shrink-0 lg:flex select-none">
      <aside
        className={`admin-sidebar relative sticky top-0 z-30 flex h-screen flex-col justify-between border-r border-border-theme/80 bg-card/95 dark:bg-slate-950/95 backdrop-blur-2xl transition-all duration-300 ease-in-out shadow-2xl shadow-black/5 dark:shadow-black/50 overflow-visible ${
          isCollapsed ? "w-[78px]" : "w-72 xl:w-76"
        }`}
      >
        {/* ─── AMBIENT AURORA MESH GLOWS ─── */}
        <div className="absolute -top-16 -left-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-16 h-36 w-36 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        {/* ─── TOP SECTION: BRAND & SEARCH BAR ─── */}
        <div className="relative shrink-0 p-3 pb-2 border-b border-border-theme/70 bg-gradient-to-b from-background/40 to-transparent">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="cursor-pointer group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]"
              title="GiftFestive Admin Command Center"
            >
              {/* Neon Glow Icon Box with Holographic Ring */}
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/15 to-purple-500/20 border border-cyan-500/35 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <img
                  src="/images/GiftFestive.png"
                  alt="GiftFestive"
                  className="h-6 w-6 object-contain transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-card shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
                </span>
              </div>

              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="truncate text-sm font-black tracking-tight bg-clip-text text-transparent"
                      style={{ backgroundImage: "var(--primary-gradient)" }}
                    >
                      GiftFestive
                    </span>
                    <span className="rounded-md bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.5 text-[8.5px] font-black text-cyan-400 tracking-wider">
                      PRO
                    </span>
                  </div>
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                    Storefront Online (24/7)
                  </p>
                </div>
              )}
            </Link>

            {/* Collapse / Expand Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setIsCollapsed(!isCollapsed);
                setFlyoutMenu(null);
              }}
              className="cursor-pointer group rounded-xl p-1.5 text-slate-400 hover:text-foreground hover:bg-hover-theme transition-all border border-transparent hover:border-border-theme/70 shadow-2xs"
              title={isCollapsed ? "Expand sidebar (>>)" : "Collapse sidebar (<<)"}
            >
              {isCollapsed ? (
                <ChevronsRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 text-cyan-400" />
              ) : (
                <ChevronsLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              )}
            </button>
          </div>

          {/* ─── COMMAND / SEARCH BAR ─── */}
          {!isCollapsed && (
            <div className="relative mt-2.5">
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Jump to page... (⌘K)"
                  className="cursor-pointer w-full rounded-xl border border-border-theme/80 bg-background/70 pl-8.5 pr-8 py-1.5 text-xs text-foreground placeholder:text-slate-400 focus:border-cyan-500/60 focus:bg-background focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none rounded bg-white/5 border border-border-theme px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── CENTER NAVIGATION AREA ─── */}
        <div className="relative flex-1 overflow-y-auto p-2.5 space-y-3.5 scrollbar-thin">
          {/* SEARCH RESULTS VIEW */}
          {searchResults ? (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-500 flex items-center justify-between">
                <span>Found {searchResults.length} Match{searchResults.length === 1 ? "" : "es"}</span>
                <span className="text-[9px] text-slate-400 font-normal">Press ESC to reset</span>
              </div>
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matching pages found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                searchResults.map(({ sectionTitle, item }) => {
                  const ChildIcon = item.icon || FileText;
                  const active = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setSearchQuery("")}
                      className={`cursor-pointer group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-all ${
                        active
                          ? "bg-pink-500 text-white font-bold shadow-xs border border-pink-500/20"
                          : "text-slate-600 dark:text-slate-300 hover:bg-hover-theme hover:text-foreground hover:translate-x-1"
                      }`}
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-background border border-border-theme/70 text-slate-400 group-hover:text-primary">
                        <ChildIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{item.label}</p>
                        <p className="truncate text-[10px] text-slate-400">{sectionTitle}</p>
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-foreground" />
                    </Link>
                  );
                })
              )}
            </div>
          ) : (
            /* NORMAL CATEGORIZED NAVIGATION */
            filteredNav.map((section) => (
              <div key={section.sectionTitle} className="space-y-1">
                {/* Section Header with Indicator Dot and Divider */}
                {!isCollapsed && (
                  <div className="flex items-center gap-2 px-2.5 py-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${section.dotColor} shadow-[0_0_6px_currentColor]`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400/90 dark:text-slate-500">
                      {section.sectionTitle}
                    </span>
                    <span className="flex-1 h-px bg-gradient-to-r from-border-theme/80 to-transparent" />
                  </div>
                )}

                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isItemActive(pathname, item.href, item.children);
                    const Icon = item.icon;
                    const hasChildren = Boolean(item.children && item.children.length > 0);
                    const isExpanded = openGroup === item.key;

                    // Direct single link (Dashboard, AI Assistant, Users)
                    if (!hasChildren) {
                      return (
                        <Link
                          key={item.key}
                          href={item.href!}
                          className={`cursor-pointer group relative flex items-center rounded-xl transition-all duration-150 ${
                            isCollapsed
                              ? "h-10 w-10 mx-auto justify-center"
                              : "px-2.5 py-2 text-[12.5px] font-medium gap-2.5"
                          } ${
                            active
                              ? "bg-pink-500 text-white shadow-md font-bold border border-pink-500/20"
                              : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-hover-theme/85 hover:translate-x-0.5"
                          }`}
                          title={item.label}
                        >
                          {/* Left Glowing Indicator Notch */}
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                          )}

                          <div
                            className={`flex items-center justify-center shrink-0 ${
                              isCollapsed
                                ? "h-8 w-8 rounded-xl border border-border-theme/70 bg-background/80"
                                : "h-7 w-7 rounded-lg"
                            } ${
                              active
                                ? "text-white"
                                : "text-slate-400 group-hover:text-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          {!isCollapsed && (
                            <>
                              <span className="truncate flex-1 font-semibold">{item.label}</span>
                              {item.badge && (
                                <span className="flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[9px] font-extrabold text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  {item.badge}
                                </span>
                              )}
                              {active && <ChevronRight className="h-3 w-3 text-white" />}
                            </>
                          )}
                        </Link>
                      );
                    }

                    // Accordion Item with Children (Catalog, Orders, SEO Suite, etc.)
                    return (
                      <div key={item.key} className="space-y-0.5">
                        <button
                          type="button"
                          data-sidebar-trigger={item.key}
                          onClick={() => {
                            if (isCollapsed) {
                              setIsCollapsed(false);
                              setOpenGroup(item.key);
                              setFlyoutMenu(null);
                            } else {
                              toggleAccordion(item.key);
                            }
                          }}
                          onMouseEnter={(e) => handleCollapsedItemEnter(item, e)}
                          onMouseLeave={handleCollapsedItemLeave}
                          className={`cursor-pointer group relative flex w-full items-center rounded-xl transition-all duration-150 ${
                            isCollapsed
                              ? "h-10 w-10 mx-auto justify-center"
                              : "px-2.5 py-2 text-[12.5px] font-medium gap-2.5"
                          } ${
                            active
                              ? "text-pink-700 dark:text-pink-400 font-bold bg-pink-500/10 dark:bg-pink-500/15 border border-pink-500/20 shadow-2xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-hover-theme/80 hover:translate-x-0.5 border border-transparent"
                          }`}
                          title={isCollapsed ? `${item.label} (Click to expand sidebar, Hover for sub-menu)` : item.label}
                        >
                          {/* Active Dot indicator if child is active */}
                          {active && (
                            <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.9)] animate-pulse" />
                          )}

                          {/* Collapsed dot badge indicating presence of children */}
                          {isCollapsed && hasChildren && (
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-card shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
                          )}

                          <div
                            className={`flex items-center justify-center shrink-0 ${
                              isCollapsed
                                ? "h-8 w-8 rounded-xl border border-border-theme/70 bg-background/80"
                                : "h-7 w-7 rounded-lg"
                            } ${
                              active
                                ? "bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/30"
                                : "bg-background/80 border border-border-theme/70 text-slate-400 group-hover:text-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          {!isCollapsed && (
                            <>
                              <span className="truncate flex-1 text-left font-semibold">{item.label}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-background border border-border-theme/70 text-slate-400">
                                  {item.children?.length}
                                </span>
                                <ChevronDown
                                  className={`h-3.5 w-3.5 transition-transform duration-200 text-slate-400 ${
                                    isExpanded ? "rotate-180 text-foreground" : ""
                                  }`}
                                />
                              </div>
                            </>
                          )}
                        </button>

                        {/* Expanded Children Nested List (Single Accordion open at a time) */}
                        {!isCollapsed && isExpanded && item.children && (
                          <div className="relative ml-4 pl-3.5 border-l-2 border-primary/20 dark:border-cyan-500/20 space-y-1 mt-1 py-0.5 animate-in fade-in duration-150">
                            {item.children.map((child) => {
                              const childActive = checkChildActive(pathname, child.href, item.children);
                              const ChildIcon = child.icon || FileText;

                              return (
                                <Link
                                  key={child.key}
                                  href={child.href}
                                  className={`cursor-pointer group relative flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[12px] transition-all duration-150 ${
                                    childActive
                                      ? "bg-primary/10 text-primary border border-primary/20 font-bold dark:bg-primary/15"
                                      : "text-slate-600 dark:text-slate-400 font-medium hover:text-foreground hover:bg-hover-theme hover:translate-x-1"
                                  }`}
                                >
                                  {/* Left Anchor Glowing Node on Track */}
                                  {childActive && (
                                    <span className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-card shadow-[0_0_8px_var(--primary)]" />
                                  )}

                                  <div
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                      childActive
                                        ? "bg-primary text-white shadow-2xs"
                                        : child.color || "bg-background border border-border-theme/70 text-slate-400 group-hover:text-primary"
                                    }`}
                                  >
                                    <ChildIcon className="h-3.5 w-3.5" />
                                  </div>
                                  <span className="truncate flex-1">{child.label}</span>
                                  {child.badge && (
                                    <span className="text-[9.5px] font-black uppercase tracking-tight px-1.5 py-0.2 rounded-md bg-background border border-border-theme/80 text-slate-400 group-hover:text-pink-500 group-hover:border-pink-500/30 transition shrink-0">
                                      {child.badge}
                                    </span>
                                  )}
                                  {childActive && (
                                    <ChevronRight className="ml-1 h-3 w-3 text-pink-500 shrink-0" />
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ─── FLOATING FLYOUT MENU FOR COLLAPSED MODE ─── */}
        {isCollapsed && flyoutMenu && (
          <div
            ref={flyoutRef}
            className="fixed left-[72px] pl-3 z-50 animate-in fade-in zoom-in-95 duration-150 select-none before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-8 before:content-['']"
            style={{ top: flyoutMenu.top }}
            onMouseEnter={handleFlyoutMouseEnter}
            onMouseLeave={handleFlyoutMouseLeave}
          >
            <div className="relative w-64 rounded-2xl border border-border-theme/80 bg-card/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl p-2.5">
              {/* Left Arrow Notch */}
              <div className="absolute -left-1.5 top-4.5 h-3 w-3 rotate-45 border-l border-b border-border-theme/80 bg-card dark:bg-slate-950" />

              {/* Popover Header */}
              <div className="relative flex items-center justify-between pb-2 mb-1.5 border-b border-border-theme/70">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <flyoutMenu.item.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black uppercase tracking-wider text-foreground">
                      {flyoutMenu.item.label}
                    </p>
                    <p className="truncate text-[9.5px] text-slate-400 font-medium">
                      Quick Sub-menu
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-background border border-border-theme/70 text-slate-400">
                    {flyoutMenu.item.children?.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFlyoutMenu(null)}
                    className="cursor-pointer flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:text-foreground hover:bg-hover-theme transition"
                    title="Close"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Popover Child Links */}
              <div className="relative space-y-1">
                {flyoutMenu.item.children?.map((child) => {
                  const childActive = checkChildActive(pathname, child.href, flyoutMenu.item.children);
                  const ChildIcon = child.icon || FileText;
                  return (
                    <Link
                      key={child.key}
                      href={child.href}
                      onClick={() => {
                        setIsCollapsed(false);
                        setOpenGroup(flyoutMenu.item.key);
                        setFlyoutMenu(null);
                      }}
                      className={`cursor-pointer group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs transition-all ${
                        childActive
                          ? "bg-primary/10 text-primary border border-primary/20 font-bold dark:bg-primary/15 dark:border dark:border-primary/30 shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-hover-theme hover:text-foreground hover:translate-x-1"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                          childActive
                            ? "bg-primary text-white"
                            : child.color || "bg-background border border-border-theme/70 text-slate-400"
                        }`}
                      >
                        <ChildIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{child.label}</p>
                        {child.description && (
                          <p className="truncate text-[9.5px] text-slate-400">{child.description}</p>
                        )}
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-foreground" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── BOTTOM SECTION: USER PROFILE & SYSTEM DOCK ─── */}
        <div className="relative shrink-0 p-2.5 border-t border-border-theme/70 bg-gradient-to-t from-background/70 to-transparent">
          {!isCollapsed ? (
            <div className="space-y-2">
              {/* User Profile Card */}
              <div className="flex items-center gap-2.5 rounded-xl border border-border-theme/80 bg-card/90 p-2 shadow-xs transition-all hover:border-cyan-500/30">
                <div className="relative flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 font-black text-white text-xs shadow-xs p-0.5">
                  <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-900 text-white">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "SO"}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-card shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-xs font-bold text-foreground">
                      {user?.name || "Sonu prajapati"}
                    </p>
                    <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                  </div>
                  <p className="truncate text-[10px] text-slate-400 font-medium">
                    Super Administrator
                  </p>
                </div>
                <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[8.5px] font-black text-emerald-400 tracking-wider">
                  ACTIVE
                </span>
              </div>

              {/* Utility Actions Row */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="cursor-pointer group flex h-8.5 items-center justify-center rounded-xl border border-border-theme bg-background hover:bg-hover-theme text-foreground shadow-2xs transition-all hover:scale-105"
                  title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
                  ) : (
                    <Moon className="h-4 w-4 text-indigo-500 transition-transform duration-300 group-hover:-rotate-12" />
                  )}
                </button>

                <Link
                  href="/admins"
                  className="cursor-pointer group flex h-8.5 items-center justify-center rounded-xl border border-border-theme bg-background hover:bg-hover-theme text-foreground shadow-2xs transition-all hover:scale-105"
                  title="Admin Settings & Profile"
                >
                  <Settings className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90 text-slate-400 group-hover:text-foreground" />
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="cursor-pointer group flex h-8.5 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 shadow-2xs transition-all hover:scale-105"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Collapsed Mode Bottom Controls */
            <div className="space-y-2 flex flex-col items-center">
              <button
                type="button"
                onClick={toggleTheme}
                className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl border border-border-theme bg-background hover:bg-hover-theme text-foreground shadow-2xs transition-all hover:scale-105"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
              </button>

              <button
                type="button"
                onClick={logout}
                className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 shadow-2xs transition-all hover:scale-105"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function MobileSidebar() {
  const pathname = usePathname();
  const { mobileOpen, closeMobile } = useSidebar();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const filteredNav = useFilteredNav(user);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    filteredNav.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children?.some((child) => pathname?.startsWith(child.href))) {
          setOpenGroup(item.key);
        }
      });
    });
  }, [pathname, filteredNav]);

  if (!mobileOpen) return null;

  const toggleAccordion = (key: string) => {
    setOpenGroup((prev) => (prev === key ? null : key));
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden cursor-pointer"
        aria-label="Close menu"
        onClick={closeMobile}
      />

      <aside className="admin-sidebar fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2.5rem,340px)] flex-col border-r border-border-theme bg-card/95 backdrop-blur-2xl shadow-2xl lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-border-theme px-4 py-3.5 bg-gradient-to-b from-background/40 to-transparent">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/GiftFestive.png"
              alt="GiftFestive"
              className="h-7 w-7 object-contain"
            />
            <span
              className="text-base font-black tracking-tight bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--primary-gradient)" }}
            >
              GiftFestive
            </span>
          </div>
          <button
            type="button"
            onClick={closeMobile}
            className="cursor-pointer rounded-xl p-2 text-slate-500 hover:bg-hover-theme transition"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation List */}
        <nav className="flex-1 space-y-3.5 overflow-y-auto p-3 scrollbar-thin">
          {filteredNav.map((section) => (
            <div key={section.sectionTitle} className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-0.5">
                <span className={`h-1.5 w-1.5 rounded-full ${section.dotColor}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {section.sectionTitle}
                </span>
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isItemActive(pathname, item.href, item.children);
                  const Icon = item.icon;
                  const isExpanded = openGroup === item.key;

                  if (!item.children) {
                    return (
                      <Link
                        key={item.key}
                        href={item.href!}
                        onClick={closeMobile}
                        className={`cursor-pointer flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          active
                            ? "bg-pink-500 text-white shadow-md font-bold"
                            : "text-slate-600 dark:text-slate-300 hover:bg-hover-theme"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-400">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  }

                  return (
                    <div key={item.key} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleAccordion(item.key)}
                        className={`cursor-pointer flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          active
                            ? "bg-pink-500/10 text-pink-700 border border-pink-500/20 font-bold dark:bg-pink-500/15 dark:text-pink-400"
                            : "text-foreground hover:bg-hover-theme"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-pink-600 dark:text-pink-400" : "text-slate-400"
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="ml-4 pl-3 border-l-2 border-primary/20 space-y-1 mt-1">
                          {item.children.map((child) => {
                            const childActive = checkChildActive(pathname, child.href, item.children);
                            const ChildIcon = child.icon || FileText;
                            return (
                              <Link
                                key={child.key}
                                href={child.href}
                                onClick={closeMobile}
                                className={`cursor-pointer flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs transition ${
                                  childActive
                                    ? "bg-pink-500/10 text-pink-700 border border-pink-500/20 font-bold dark:bg-pink-500/15 dark:text-pink-400"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-hover-theme"
                                }`}
                              >
                                <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate flex-1">{child.label}</span>
                                {child.badge && (
                                  <span className="text-[9.5px] font-black uppercase tracking-tight px-1.5 py-0.2 rounded-md bg-background border border-border-theme/80 text-slate-400">
                                    {child.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Mobile Bottom Controls */}
        <div className="space-y-2 border-t border-border-theme p-3 bg-background/50">
          <button
            type="button"
            onClick={toggleTheme}
            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl border border-border-theme bg-card py-2 text-xs font-bold shadow-xs transition hover:bg-hover-theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            type="button"
            onClick={() => {
              closeMobile();
              logout();
            }}
            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:from-rose-600 hover:to-rose-700 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
