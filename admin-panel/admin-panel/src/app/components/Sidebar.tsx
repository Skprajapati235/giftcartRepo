"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ElementType } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Home, ShoppingBag, Box, ShoppingCart, Tag, Users, Settings, LogOut, ArrowLeft, Moon, Sun } from "lucide-react";

type NavChild = {
  key: string;
  href: string;
  label: string;
  icon: ElementType;
};

type NavItem = {
  key: string;
  href?: string;
  label: string;
  icon: ElementType;
  children?: NavChild[];
};

const navigation: NavItem[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: Home },
  {
    key: "shop",
    label: "Shop",
    icon: ShoppingBag,
    children: [
      { key: "products", href: "/products", label: "Products", icon: Box },
      { key: "orders", href: "/orders", label: "Orders", icon: ShoppingCart },
    ],
  },
  { key: "category", href: "/category", label: "Categories", icon: Tag },
  { key: "users", href: "/users", label: "Users", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const groupKey = navigation.find((item) =>
      item.children?.some((child) => pathname?.startsWith(child.href))
    )?.key;
    setActivePanel(groupKey ?? null);
    setShowAdminMenu(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const isPathActive = (href?: string, children?: NavChild[]) => {
    if (!pathname) return false;
    if (href) return pathname.startsWith(href);
    if (children) return children.some((item) => pathname.startsWith(item.href));
    return false;
  };

  const handlePanelOpen = (item: NavItem) => {
    if (item.children) {
      setActivePanel(item.key);
      setShowAdminMenu(false);
      return;
    }
    setActivePanel(null);
    setShowAdminMenu(false);
  };

  const activeGroup = navigation.find((item) => item.key === activePanel && item.children);

  return (
    <div className="flex h-screen">
      <aside className="sticky top-0 h-screen w-20 border-r border-border-theme bg-background transition-colors duration-300">
        <div className="flex h-full flex-col justify-between px-3 py-4">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-xl">
              <span className="text-lg font-bold">G</span>
            </div>

            <nav className="space-y-4">
              {navigation.map((item) => {
                const active = isPathActive(item.href, item.children);
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex flex-col items-center">
                    {item.children ? (
                      <button
                        type="button"
                        onClick={() => handlePanelOpen(item)}
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
                          active 
                            ? "bg-primary text-white shadow-lg scale-105 ring-2 ring-primary/20" 
                            : "text-slate-400 hover:bg-hover-theme hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    ) : (
                      <Link
                        href={item.href!}
                        onClick={() => handlePanelOpen(item)}
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
                          active 
                            ? "bg-primary text-white shadow-lg scale-105 ring-2 ring-primary/20" 
                            : "text-slate-400 hover:bg-hover-theme hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    )}
                    <span className={`mt-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${active ? "text-foreground" : "text-slate-500"}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-11 w-full items-center justify-center rounded-2xl border border-border-theme bg-card text-foreground transition hover:bg-hover-theme shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdminMenu((current) => !current);
                setActivePanel(null);
              }}
              className="flex h-11 w-full items-center justify-center rounded-2xl border border-border-theme bg-card text-foreground transition hover:bg-hover-theme shadow-sm"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      <div
        className={`sticky top-0 h-screen flex-shrink-0 overflow-hidden border-r border-border-theme bg-card transition-all duration-300 ${
          activeGroup ? "w-72 opacity-100 pointer-events-auto" : "w-0 opacity-0 pointer-events-none"
        }`}
      >
        {activeGroup && (
          <div className="h-full p-5">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <activeGroup.icon className="h-5 w-5 text-foreground" />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{activeGroup.label}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePanel(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-hover-theme hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {activeGroup.children?.map((child) => {
                const childActive = pathname?.startsWith(child.href);
                const ChildIcon = child.icon;
                return (
                  <Link
                    key={child.key}
                    href={child.href}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-sm font-bold transition-all duration-300 ${
                      childActive 
                        ? "border-primary bg-primary text-white shadow-xl translate-x-1" 
                        : "border-transparent bg-background text-slate-400 hover:bg-hover-theme hover:text-foreground hover:border-border-theme"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${childActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"}`}>
                      <ChildIcon className="h-4 w-4" />
                    </div>
                    <span>{child.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div
        className={`sticky top-0 h-screen flex-shrink-0 overflow-hidden border-r border-border-theme bg-card transition-all duration-300 ${
          showAdminMenu ? "w-64 opacity-100 pointer-events-auto" : "w-0 opacity-0 pointer-events-none"
        }`}
      >
        {showAdminMenu && (
          <div className="h-full p-5">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-foreground" />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin</p>
                  <h2 className="text-lg font-semibold text-foreground">Account</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminMenu(false)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-hover-theme hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <button className="w-full rounded-2xl border border-border-theme bg-background px-4 py-4 text-left text-sm font-bold text-foreground transition hover:bg-hover-theme">
                Profile settings
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-between rounded-2xl bg-rose-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                Logout
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
