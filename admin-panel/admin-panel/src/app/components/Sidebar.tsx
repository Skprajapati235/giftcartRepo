"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ElementType } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Home,
  ShoppingBag,
  Box,
  ShoppingCart,
  Tag,
  Users,
  Settings,
  LogOut,
  ArrowLeft,
  Moon,
  Sun,
  CreditCard,
  MapPin,
} from "lucide-react";

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

// ✅ Navigation array including admin children
const navigation: NavItem[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: Home },
  {
    key: "shop",
    label: "Shop",
    icon: ShoppingBag,
    children: [
      { key: "products", href: "/products", label: "Products", icon: Box },
      { key: "cities", href: "/cities", label: "Cities", icon: MapPin },
      { key: "orders", href: "/orders", label: "Orders", icon: ShoppingCart },
      { key: "payments", href: "/payments", label: "Payments", icon: CreditCard },
    ],
  },
  { key: "category", href: "/category", label: "Categories", icon: Tag },
  { key: "users", href: "/users", label: "Users", icon: Users },
  {
    key: "admin",
    label: "Admin",
    icon: Settings,
    children: [
      { key: "adminProfile", href: "/admins", label: "Admin Profile", icon: Users },
      { key: "Developer", href: "/developer", label: "Developer", icon: Users },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  // ✅ Open panel based on pathname
  useEffect(() => {
    const groupKey = navigation.find((item) =>
      item.children?.some((child) => pathname?.startsWith(child.href))
    )?.key;

    setActivePanel(groupKey ?? null);
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
      return;
    }
    setActivePanel(null);
  };

  const activeGroup = navigation.find((item) => item.key === activePanel && item.children);

  return (
    <div className="flex h-screen">
      {/* Sidebar icons */}
      <aside className="sticky top-0 h-screen w-28 border-r border-border-theme bg-background transition-colors duration-300">
        <div className="flex h-full flex-col justify-between px-3 py-3">
          <div className="space-y-4">
            <div className="pt-4 pb-2">
              <span className="text-lg font-bold">
                <img src="/images/GiftorawithText2.png" alt="" className="h-8 object-cover" />
              </span>
            </div>

            <nav className="space-y-4">
              {navigation
                .filter((item) => item.key !== "admin") // exclude admin for bottom icon
                .map((item) => {
                  const active = isPathActive(item.href, item.children);
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex flex-col items-center">
                      {item.children ? (
                        <button
                          type="button"
                          onClick={() => handlePanelOpen(item)}
                          className={`flex h-15 w-18 items-center justify-center rounded-2xl transition-all duration-300 ${active
                            ? "bg-primary text-white shadow-lg scale-105 ring-2 ring-primary/20"
                            : "text-slate-400 hover:bg-hover-theme hover:text-foreground"
                            }`}
                        >
                          <Icon className="h-8 w-8" />
                        </button>
                      ) : (
                        <Link
                          href={item.href!}
                          onClick={() => handlePanelOpen(item)}
                          className={`flex h-15 w-18 items-center justify-center rounded-2xl transition-all duration-300 ${active
                            ? "bg-primary text-white shadow-lg scale-105 ring-2 ring-primary/20"
                            : "text-slate-400 hover:bg-hover-theme hover:text-foreground"
                            }`}
                        >
                          <Icon className="h-8 w-8" />
                        </Link>
                      )}
                      <span
                        className={`mt-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${active ? "text-foreground" : "text-slate-500"
                          }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
            </nav>
          </div>

          {/* Bottom controls: Theme toggle + Admin */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-11 w-full items-center justify-center rounded-2xl border border-border-theme bg-card text-foreground transition hover:bg-hover-theme shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Admin icon */}
            <button
              type="button"
              onClick={() => handlePanelOpen(navigation.find((i) => i.key === "admin")!)}
              className={`flex h-11 w-full items-center justify-center rounded-2xl border border-border-theme bg-card text-foreground transition hover:bg-hover-theme shadow-sm ${activePanel === "admin" ? "bg-primary text-white shadow-lg" : ""
                }`}
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Panel for children (Shop/Admin) */}
      <div
        className={`sticky top-0 h-screen flex-shrink-0 overflow-hidden border-r border-border-theme bg-card transition-all duration-300 ${activeGroup ? "w-72 opacity-100 pointer-events-auto" : "w-0 opacity-0 pointer-events-none"
          }`}
      >
        {activeGroup && (
          <div className="h-full p-5 flex flex-col justify-between">
            <div>
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
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-sm font-bold transition-all duration-300 ${childActive
                        ? "border-primary bg-primary text-white shadow-xl translate-x-1"
                        : "border-transparent bg-background text-slate-400 hover:bg-hover-theme hover:text-foreground hover:border-border-theme"
                        }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg ${childActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"
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

            {/* Logout button at bottom of Admin panel */}
            {activePanel === "admin" && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-between rounded-2xl bg-rose-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-rose-600"
                >
                  Logout
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}