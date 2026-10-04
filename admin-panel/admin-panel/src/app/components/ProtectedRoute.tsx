"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import GlobalLoader from "./GlobalLoaders/GlobalLoader";
import { canAccessPage, getPageRoleInfo } from "../utils/rbacConfig";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, loading, user, switchRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";

  useEffect(() => {
    if (!loading && !authenticated) {
      if (typeof window !== "undefined") {
        window.location.replace("/?expired=true");
      } else {
        router.replace("/");
      }
    }
  }, [authenticated, loading, router]);

  // Handle bfcache (browser back/forward button restore)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        const token = localStorage.getItem("giftcartAdminToken");
        const lastActive = Number(localStorage.getItem("giftcartAdminLastActive") || 0);
        if (!token || (lastActive && Date.now() - lastActive > 30000)) {
          window.location.replace("/?expired=true");
        }
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  if (loading || !authenticated) {
    return <GlobalLoader />;
  }

  // Check RBAC permissions for the current page
  const hasAccess = canAccessPage(user?.role, pathname);

  if (!hasAccess) {
    const pageInfo = getPageRoleInfo(pathname);
    const userRoleDisplay = (user?.role || "Team Member").replace(/_/g, " ").toUpperCase();

    const getDefaultRouteForRole = (role: string = "") => {
      switch (role.toLowerCase()) {
        case "kitchen_manager":
          return "/orders/board";
        case "delivery_coordinator":
          return "/delivery-fleet";
        case "support_agent":
          return "/abandoned-carts";
        case "seo_specialist":
          return "/seo/global";
        default:
          return "/dashboard";
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center bg-card rounded-3xl border border-rose-500/25 shadow-sm m-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4 border border-rose-500/20">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h2 className="text-xl font-black text-foreground sm:text-2xl">
          403 Access Denied: Role Restricted
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          This workstation is strictly assigned to <strong className="text-foreground">{pageInfo.assignedTo}</strong>.
        </p>

        <div className="mt-5 rounded-2xl bg-background border border-border-theme p-4 text-xs space-y-1.5 max-w-sm w-full text-left">
          <div className="flex justify-between">
            <span className="text-slate-400">Your Current Role:</span>
            <span className="font-bold text-rose-500">{userRoleDisplay}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Assigned Department:</span>
            <span className="font-bold text-foreground">{pageInfo.department}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Required Roles:</span>
            <span className="font-mono text-pink-500 font-bold">{pageInfo.allowedRoles.join(", ")}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push(getDefaultRouteForRole(user?.role))}
            className="flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-pink-600 active:scale-95 transition shadow-md shadow-pink-500/20"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go to Your Assigned Workstation</span>
          </button>

          <button
            type="button"
            onClick={() => switchRole("super_admin")}
            className="flex items-center gap-2 rounded-xl border border-pink-500/20 bg-pink-500/10 px-4 py-2.5 text-xs font-bold text-pink-500 hover:bg-pink-500/20 active:scale-95 transition"
            title="Switch back to Super Admin root role"
          >
            <span>👑 Switch to Super Admin</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
