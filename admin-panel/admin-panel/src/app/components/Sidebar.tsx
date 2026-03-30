"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ElementType } from "react";
import { useAuth } from "../context/AuthContext";
import { Home, ShoppingBag, Box, ShoppingCart, Tag, Users, Settings, LogOut, ArrowLeft } from "lucide-react";

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
  const [activePanel, setActivePanel] = useState<string | null>(
    navigation.find((item) => item.children?.some((child) => pathname?.startsWith(child.href)))?.key ?? null
  );
  const [showAdminMenu, setShowAdminMenu] = useState(false);

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
  };

  const activeGroup = navigation.find((item) => item.key === activePanel && item.children);

  return (
    <div className="flex h-screen">
      <aside className="sticky top-0 h-screen w-20 border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex h-full flex-col justify-between px-3 py-4">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-white">
              <span className="text-lg font-bold">G</span>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const active = isPathActive(item.href, item.children);
                const Icon = item.icon;
                return (
                  <div key={item.key}>
                    {item.children ? (
                      <button
                        type="button"
                        onClick={() => handlePanelOpen(item)}
                        className={`flex h-12 w-full items-center justify-center rounded-3xl transition ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800"}`}
                      >
                        <Icon className="h-6 w-6" />
                      </button>
                    ) : (
                      <Link
                        href={item.href!}
                        onClick={() => handlePanelOpen(item)}
                        className={`flex h-12 w-full items-center justify-center rounded-3xl transition ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800"}`}
                      >
                        <Icon className="h-6 w-6" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setShowAdminMenu((current) => !current);
                setActivePanel(null);
              }}
              className="flex h-12 w-full items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-200 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>
      </aside>

      {activeGroup ? (
        <aside className="sticky top-0 h-screen w-72 border-r border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <activeGroup.icon className="h-5 w-5 text-slate-900" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{activeGroup.label}</p>
                {/* <h2 className="text-lg font-semibold text-slate-900">Select item</h2> */}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
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
                  onClick={() => setActivePanel(null)}
                  className={`flex items-center gap-3 rounded-3xl border px-4 py-4 text-sm font-medium transition ${childActive ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-900"}`}
                >
                  <ChildIcon className="h-5 w-5" />
                  <div>
                    <p>{child.label}</p>
                    {/* <span className="text-xs text-slate-500">Manage {child.label.toLowerCase()}</span> */}
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>
      ) : null}

      {showAdminMenu ? (
        <aside className="sticky top-0 h-screen w-64 border-r border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-slate-900" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin</p>
                <h2 className="text-lg font-semibold text-slate-900">Account</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdminMenu(false)}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <button className="w-full rounded-3xl bg-slate-100 px-4 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900">
              Profile settings
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-3xl bg-rose-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Logout
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
