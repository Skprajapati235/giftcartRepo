"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/category", label: "Categories" },
  { href: "/users", label: "Users" },
  { href: "/admins", label: "Admins" },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="sticky top-0 h-screen w-72 overflow-hidden border-r border-slate-200 bg-slate-50 px-6 py-8 flex flex-col justify-between dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <div>
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Admin Panel</p>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">GiftCart</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Manage products, categories, users and admins</p>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-10 space-y-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
