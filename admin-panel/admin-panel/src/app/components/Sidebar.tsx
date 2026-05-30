"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ElementType } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import {
  adminNavigation,
  type NavChild,
  type NavItem,
} from "../config/adminNavigation";
import {
  ArrowLeft,
  LogOut,
  Moon,
  Sun,
  X,
  ChevronDown,
  Settings,
} from "lucide-react";

function isPathActive(pathname: string | null, href?: string, children?: NavChild[]) {
  if (!pathname) return false;
  if (href) return pathname.startsWith(href);
  if (children) return children.some((item) => pathname.startsWith(item.href));
  return false;
}

function DesktopSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const groupKey = adminNavigation.find((item) =>
      item.children?.some((child) => pathname?.startsWith(child.href))
    )?.key;
    setActivePanel(groupKey ?? null);
  }, [pathname]);

  const handlePanelOpen = (item: NavItem) => {
    if (item.children) {
      setActivePanel(item.key);
      return;
    }
    setActivePanel(null);
  };

  const activeGroup = adminNavigation.find(
    (item) => item.key === activePanel && item.children
  );

  const mainNav = adminNavigation.filter((item) => item.key !== "admin");
  const adminItem = adminNavigation.find((item) => item.key === "admin")!;

  return (
    <div className="hidden h-screen shrink-0 lg:flex">
      <aside className="sticky top-0 h-screen w-24 border-r border-border-theme bg-background xl:w-28">
        <div className="flex h-full flex-col justify-between px-2 py-3 xl:px-3">
          <div className="space-y-4">
            <div className="pb-2 pt-2">
              <img
                src="/images/GiftorawithText2.png"
                alt="Giftora"
                className="mx-auto h-8 object-contain"
              />
            </div>
            <nav className="space-y-3">
              {mainNav.map((item) => {
                const active = isPathActive(pathname, item.href, item.children);
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex flex-col items-center">
                    {item.children ? (
                      <button
                        type="button"
                        onClick={() => handlePanelOpen(item)}
                        className={`flex h-12 w-14 items-center justify-center rounded-2xl transition-all xl:h-14 xl:w-16 ${
                          active
                            ? "bg-primary text-white shadow-lg ring-2 ring-primary/20"
                            : "text-slate-400 hover:bg-hover-theme hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-6 w-6 xl:h-7 xl:w-7" />
                      </button>
                    ) : (
                      <Link
                        href={item.href!}
                        onClick={() => handlePanelOpen(item)}
                        className={`flex h-12 w-14 items-center justify-center rounded-2xl transition-all xl:h-14 xl:w-16 ${
                          active
                            ? "bg-primary text-white shadow-lg ring-2 ring-primary/20"
                            : "text-slate-400 hover:bg-hover-theme hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-6 w-6 xl:h-7 xl:w-7" />
                      </Link>
                    )}
                    <span
                      className={`mt-1 max-w-full truncate px-0.5 text-center text-[9px] font-bold uppercase tracking-wide xl:text-[10px] ${
                        active ? "text-foreground" : "text-slate-500"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-full items-center justify-center rounded-2xl border border-border-theme bg-card text-foreground shadow-sm transition hover:bg-hover-theme"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => handlePanelOpen(adminItem)}
              className={`flex h-10 w-full items-center justify-center rounded-2xl border border-border-theme bg-card text-foreground shadow-sm transition hover:bg-hover-theme ${
                activePanel === "admin" ? "bg-primary text-white" : ""
              }`}
              aria-label="Admin menu"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      <div
        className={`sticky top-0 h-screen shrink-0 overflow-hidden border-r border-border-theme bg-card transition-all duration-300 ${
          activeGroup ? "w-64 opacity-100" : "w-0 opacity-0 pointer-events-none"
        }`}
      >
        {activeGroup && (
          <div className="flex h-full flex-col justify-between p-4 xl:p-5">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <activeGroup.icon className="h-5 w-5 text-foreground" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {activeGroup.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePanel(null)}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-hover-theme hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {activeGroup.children?.map((child) => {
                  const childActive = pathname?.startsWith(child.href);
                  const ChildIcon = child.icon;
                  return (
                    <Link
                      key={child.key}
                      href={child.href}
                      className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                        childActive
                          ? "border-primary bg-primary text-white shadow-lg"
                          : "border-transparent bg-background text-slate-500 hover:border-border-theme hover:bg-hover-theme hover:text-foreground"
                      }`}
                    >
                      <div
                        className={`rounded-lg p-1.5 ${
                          childActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"
                        }`}
                      >
                        <ChildIcon className="h-4 w-4" />
                      </div>
                      <span>{child.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            {activePanel === "admin" && (
              <button
                type="button"
                onClick={logout}
                className="mt-4 flex w-full items-center justify-between rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                Logout
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MobileNavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
  indent = false,
}: {
  href: string;
  label: string;
  icon: ElementType;
  active: boolean;
  onNavigate: () => void;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        indent ? "ml-3" : ""
      } ${
        active
          ? "bg-primary text-white"
          : "text-slate-600 hover:bg-hover-theme hover:text-foreground dark:text-slate-300"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

function MobileSidebar() {
  const pathname = usePathname();
  const { mobileOpen, closeMobile } = useSidebar();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    adminNavigation.forEach((item) => {
      if (item.children?.some((c) => pathname?.startsWith(c.href))) {
        next[item.key] = true;
      }
    });
    setExpanded((prev) => ({ ...prev, ...next }));
  }, [pathname]);

  if (!mobileOpen) return null;

  const toggleGroup = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
        aria-label="Close menu"
        onClick={closeMobile}
      />
      <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2.5rem,320px)] flex-col border-r border-border-theme bg-card shadow-2xl lg:hidden">
        <div className="flex items-center justify-between border-b border-border-theme px-4 py-3">
          <img
            src="/images/GiftorawithText2.png"
            alt="Giftora"
            className="h-7 object-contain"
          />
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-xl p-2 text-slate-500 hover:bg-hover-theme"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {adminNavigation.map((item) => {
            if (item.children) {
              const open = expanded[item.key];
              const groupActive = isPathActive(pathname, undefined, item.children);
              const Icon = item.icon;
              return (
                <div key={item.key} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.key)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      groupActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-hover-theme"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && (
                    <div className="space-y-0.5 pb-1">
                      {item.children.map((child) => (
                        <MobileNavLink
                          key={child.key}
                          href={child.href}
                          label={child.label}
                          icon={child.icon}
                          active={Boolean(pathname?.startsWith(child.href))}
                          onNavigate={closeMobile}
                          indent
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <MobileNavLink
                key={item.key}
                href={item.href!}
                label={item.label}
                icon={Icon}
                active={Boolean(pathname?.startsWith(item.href!))}
                onNavigate={closeMobile}
              />
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-border-theme p-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-theme bg-background py-2.5 text-sm font-semibold"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            type="button"
            onClick={() => {
              closeMobile();
              logout();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
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
