"use client";

import React, { useState, useMemo } from "react";
import { TableSkeleton } from "../skeletonLoader/commonSkeleton";
import Pagination from "../Pagination";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ShieldCheck,
  Users,
  Check,
  X,
  Lock,
  UserPlus,
  Search,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/adminService";
import {
  adminTableWrapClass,
  adminTableClass,
  adminTableHeadCellClass,
  adminTableBodyCellClass,
} from "../ui/adminTable";
import { useRowActionMenu, rowActionDropdownClass } from "../ui/useRowActionMenu";
import DeleteModal from "../ui/DeleteModal";
import { useToast } from "../../../context/ToastContext";
import {
  AVAILABLE_SCREENS,
  getDefaultPermissionsForRole,
} from "../../utils/rbacConfig";

const getRoleBadgeStyle = (role: string = "") => {
  switch (role.toLowerCase()) {
    case "kitchen_manager":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "delivery_coordinator":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "support_agent":
      return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
    case "seo_specialist":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    default:
      return "bg-pink-500/10 text-pink-500 border-pink-500/20";
  }
};

const getRoleDisplayName = (role: string = "") => {
  switch (role.toLowerCase()) {
    case "kitchen_manager":
      return "👨‍🍳 Kitchen Manager";
    case "delivery_coordinator":
      return "🛵 Fleet Coordinator";
    case "support_agent":
      return "🎧 Support Agent";
    case "seo_specialist":
      return "📈 SEO Specialist";
    default:
      return "👑 Super Admin";
  }
};

const CATEGORIES = [
  "Workspace",
  "Catalog",
  "Sales & Fleet",
  "Growth & CRM",
  "Storefront & System",
] as const;

export default function AdminsPage() {
  const {
    data: admins,
    loading,
    error,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    refresh,
  } = useResource<any>(service.getAdmins, "admins");

  const { user } = useAuth();
  const activeAdminId = user?._id || null;
  const router = useRouter();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"accounts" | "rbac">("accounts");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // RBAC Matrix Filter State
  const [matrixCategory, setMatrixCategory] = useState<string>("all");
  const [matrixSearch, setMatrixSearch] = useState("");

  useRowActionMenu(openMenuId, setOpenMenuId);

  const getAdminEffectivePermissions = (adm: any): string[] => {
    if (!adm) return [];
    if (adm.role === "super_admin" || adm.role === "admin") {
      return AVAILABLE_SCREENS.map((s) => s.route);
    }
    if (Array.isArray(adm.permissions) && adm.permissions.includes("*")) {
      return AVAILABLE_SCREENS.map((s) => s.route);
    }
    if (Array.isArray(adm.permissions) && adm.permissions.length > 0) {
      return adm.permissions;
    }
    return getDefaultPermissionsForRole(adm.role);
  };

  const isScreenGrantedForAdmin = (adm: any, route: string): boolean => {
    if (!adm) return false;
    if (adm.role === "super_admin" || adm.role === "admin") return true;
    const perms = getAdminEffectivePermissions(adm);
    if (perms.includes("*")) return true;
    const cleanRoute = (route || "").toLowerCase().trim();
    return perms.some((p: string) => {
      const cleanP = (p || "").toLowerCase().trim();
      return cleanRoute === cleanP || cleanRoute.startsWith(cleanP + "/");
    });
  };

  const getGrantedCount = (adm: any): number => {
    if (!adm) return 0;
    if (adm.role === "super_admin" || adm.role === "admin") return AVAILABLE_SCREENS.length;
    return AVAILABLE_SCREENS.filter((s) => isScreenGrantedForAdmin(adm, s.route)).length;
  };

  const triggerDelete = (admin: any) => {
    if (admin._id === activeAdminId) {
      showToast("You cannot delete your own active Super Admin account", "error");
      return;
    }
    setAdminToDelete(admin);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;
    setDeleting(true);
    try {
      await service.deleteAdmin(adminToDelete._id);
      showToast("Admin account deleted successfully", "success");
      refresh();
      setDeleteModalOpen(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "Failed to delete admin", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Matrix Filtered Screens
  const matrixFilteredScreens = useMemo(() => {
    return AVAILABLE_SCREENS.filter((screen) => {
      const matchCat = matrixCategory === "all" || screen.category === matrixCategory;
      const matchQuery =
        !matrixSearch.trim() ||
        screen.label.toLowerCase().includes(matrixSearch.toLowerCase()) ||
        screen.route.toLowerCase().includes(matrixSearch.toLowerCase()) ||
        screen.department.toLowerCase().includes(matrixSearch.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [matrixCategory, matrixSearch]);

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border-theme bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20 shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Admin Team & Role-Based Access Control (RBAC)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Inspect staff workstation assignments, manage department roles, and edit screen permissions in real time.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center rounded-2xl border border-border-theme bg-background p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("accounts")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "accounts"
                ? "bg-pink-500 text-white shadow-xs"
                : "text-slate-500 hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Team Accounts ({total})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rbac")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "rbac"
                ? "bg-pink-500 text-white shadow-xs"
                : "text-slate-500 hover:text-foreground"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>RBAC Matrix & Specs</span>
          </button>
        </div>
      </div>

      {activeTab === "rbac" ? (
        /* RBAC MATRIX VIEW */
        <div className="space-y-6">
          {/* Role Coverage KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              {
                role: "super_admin",
                title: "Super Admin",
                badge: "👑 Full Root Access",
                color: "border-pink-500/30 bg-pink-500/10 text-pink-500",
                count: AVAILABLE_SCREENS.length,
                dept: "Executive Management",
                desc: "Unrestricted access to all 31 system workstations, theme studio & billing",
              },
              {
                role: "kitchen_manager",
                title: "Kitchen Manager",
                badge: "👨‍🍳 Bakery Production",
                color: "border-orange-500/30 bg-orange-500/10 text-orange-500",
                count: AVAILABLE_SCREENS.filter((s) => s.defaultRoles.includes("kitchen_manager")).length,
                dept: "Bakery & Kitchen",
                desc: "Order dispatch board, cake catalog, flavors, addons & stock inventory",
              },
              {
                role: "delivery_coordinator",
                title: "Fleet Coordinator",
                badge: "🛵 Logistics Fleet",
                color: "border-blue-500/30 bg-blue-500/10 text-blue-500",
                count: AVAILABLE_SCREENS.filter((s) => s.defaultRoles.includes("delivery_coordinator")).length,
                dept: "Logistics Fleet",
                desc: "Delivery rider dispatch, operational slots, cutoff hours & cities",
              },
              {
                role: "support_agent",
                title: "Support Agent",
                badge: "🎧 Customer Care",
                color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-500",
                count: AVAILABLE_SCREENS.filter((s) => s.defaultRoles.includes("support_agent")).length,
                dept: "CRM & Retention",
                desc: "Abandoned cart recovery, customer inquiries, leads funnel & reviews",
              },
              {
                role: "seo_specialist",
                title: "SEO Specialist",
                badge: "📈 Growth & SEO",
                color: "border-purple-500/30 bg-purple-500/10 text-purple-500",
                count: AVAILABLE_SCREENS.filter((s) => s.defaultRoles.includes("seo_specialist")).length,
                dept: "Marketing & Brand",
                desc: "SEO suite, theme branding studio, discount coupons, hero slides & stories",
              },
            ].map((item) => (
              <div
                key={item.role}
                className="rounded-3xl border border-border-theme bg-card p-4 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-block rounded-xl border px-2.5 py-0.5 text-[11px] font-black ${item.color}`}>
                    {item.badge}
                  </span>
                  <span className="text-xs font-black text-foreground">
                    {item.count} <span className="text-[10px] text-slate-400 font-normal">/ 31</span>
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-foreground">{item.title}</h4>
                  <p className="text-[10px] text-pink-500 font-semibold">{item.dept}</p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Granular Permissions Table */}
          <div className="rounded-3xl border border-border-theme bg-card shadow-sm overflow-hidden space-y-0">
            {/* Toolbar */}
            <div className="p-5 border-b border-border-theme flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card">
              <div>
                <h3 className="text-base font-black text-foreground">
                  Global Screen Access Matrix ({AVAILABLE_SCREENS.length} Total Workstations)
                </h3>
                <p className="text-xs text-slate-500">
                  Standard baseline permissions per role. Individual staff accounts can be further customized with exact screen grants.
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  placeholder="Search screen or route..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border-theme bg-background text-xs outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="px-5 py-2.5 border-b border-border-theme bg-background/50 flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setMatrixCategory("all")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  matrixCategory === "all"
                    ? "bg-pink-500 text-white shadow-2xs"
                    : "text-slate-400 hover:text-foreground"
                }`}
              >
                All Categories ({AVAILABLE_SCREENS.length})
              </button>
              {CATEGORIES.map((cat) => {
                const count = AVAILABLE_SCREENS.filter((s) => s.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMatrixCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      matrixCategory === cat
                        ? "bg-pink-500 text-white shadow-2xs"
                        : "text-slate-400 hover:text-foreground"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border-theme bg-background/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-5">System Workstation Screen</th>
                    <th className="py-3.5 px-4 text-center">Category</th>
                    <th className="py-3.5 px-4 text-center">Super Admin</th>
                    <th className="py-3.5 px-4 text-center">Kitchen Mgr</th>
                    <th className="py-3.5 px-4 text-center">Fleet Coord</th>
                    <th className="py-3.5 px-4 text-center">Support Agent</th>
                    <th className="py-3.5 px-4 text-center">SEO Specialist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-theme/60">
                  {matrixFilteredScreens.map((screen) => {
                    const kitchenAllowed = screen.defaultRoles.includes("kitchen_manager");
                    const fleetAllowed = screen.defaultRoles.includes("delivery_coordinator");
                    const supportAllowed = screen.defaultRoles.includes("support_agent");
                    const seoAllowed = screen.defaultRoles.includes("seo_specialist");

                    return (
                      <tr key={screen.route} className="hover:bg-hover-theme/60 transition">
                        <td className="py-3 px-5">
                          <p className="font-bold text-foreground text-sm leading-tight">{screen.label}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-pink-500 font-mono">{screen.route}</span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-[10px] text-slate-400">Dept: {screen.department}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-background border border-border-theme text-slate-500">
                            {screen.category}
                          </span>
                        </td>

                        {/* Super Admin */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" title="Super Admin has Full Root Access">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        </td>

                        {/* Kitchen Manager */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${
                              kitchenAllowed
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-200/60 dark:bg-slate-800/60 text-slate-400 opacity-40"
                            }`}
                          >
                            {kitchenAllowed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                          </span>
                        </td>

                        {/* Fleet Coordinator */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${
                              fleetAllowed
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-200/60 dark:bg-slate-800/60 text-slate-400 opacity-40"
                            }`}
                          >
                            {fleetAllowed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                          </span>
                        </td>

                        {/* Support Agent */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${
                              supportAllowed
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-200/60 dark:bg-slate-800/60 text-slate-400 opacity-40"
                            }`}
                          >
                            {supportAllowed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                          </span>
                        </td>

                        {/* SEO Specialist */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${
                              seoAllowed
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-200/60 dark:bg-slate-800/60 text-slate-400 opacity-40"
                            }`}
                          >
                            {seoAllowed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ACCOUNTS VIEW */
        <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden min-h-[500px]">
          {/* Header */}
          <div className="p-6 border-b border-border-theme flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card relative z-10">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                value={params.search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search staff by name, email, hub..."
                className="w-full pl-4 pr-4 py-2.5 rounded-2xl border border-border-theme bg-background text-sm outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-background px-4 py-2.5 rounded-2xl border border-border-theme font-sans">
                Total Staff: {total}
              </div>
              <button
                type="button"
                onClick={() => router.push("/admins/create")}
                className="flex items-center gap-2 rounded-2xl bg-pink-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 active:scale-95 transition cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Add Staff Account</span>
              </button>
            </div>
          </div>

          {loading ? (
            <TableSkeleton rows={8} cols={6} />
          ) : error ? (
            <div className="p-20 text-center text-rose-500 italic">{error}</div>
          ) : admins.length === 0 ? (
            <div className="p-20 text-center text-slate-400 italic">No admin accounts found.</div>
          ) : (
            <div className={`${adminTableWrapClass} min-h-[450px]`}>
              <table className={adminTableClass}>
                <thead>
                  <tr className="bg-th-bg border-b border-border-theme">
                    <th className={adminTableHeadCellClass}>Staff Member</th>
                    <th className={adminTableHeadCellClass}>Email</th>
                    <th className={adminTableHeadCellClass}>Hub / City</th>
                    <th className={adminTableHeadCellClass}>Assigned Role</th>
                    <th className={adminTableHeadCellClass}>Assigned Workstations</th>
                    <th className={`${adminTableHeadCellClass} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-theme">
                  {admins.map((admin) => {
                    const isSelf = admin._id === activeAdminId;
                    const grantedCount = getGrantedCount(admin);
                    const isSuper = admin.role === "super_admin" || admin.role === "admin";

                    return (
                      <tr
                        key={admin._id}
                        className="hover:bg-hover-theme transition-all duration-300 group border-b border-border-theme/50"
                      >
                        <td className="px-6 py-4 font-bold text-foreground">
                          <div
                            onClick={() => router.push(`/admins/${admin._id}`)}
                            className="flex items-center gap-2.5 cursor-pointer group/user"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-500 text-sm font-black border border-pink-500/20 group-hover/user:scale-105 transition">
                              {admin.name?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate group-hover/user:text-pink-500 transition">{admin.name}</span>
                                {isSelf && (
                                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" title="Current Active Session" />
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block font-normal">
                                {isSelf ? "Logged in session" : "Staff Member"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {admin.email}
                        </td>

                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {admin.city || "Faridabad Hub"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold shadow-2xs ${getRoleBadgeStyle(
                              admin.role
                            )}`}
                          >
                            {getRoleDisplayName(admin.role)}
                          </span>
                        </td>

                        {/* Assigned Workstations: Clicking navigates directly to the dedicated detail page /admins/[id] */}
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => router.push(`/admins/${admin._id}`)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition group/badge cursor-pointer border hover:shadow-xs active:scale-95 text-left"
                            style={{
                              backgroundColor: isSuper ? "rgba(236, 72, 153, 0.08)" : "rgba(6, 182, 212, 0.08)",
                              borderColor: isSuper ? "rgba(236, 72, 153, 0.25)" : "rgba(6, 182, 212, 0.25)",
                              color: isSuper ? "rgb(236, 72, 153)" : "rgb(8, 145, 178)",
                            }}
                            title="Open dedicated Workstation Inspection page"
                          >
                            {isSuper ? (
                              <>
                                <span>👑 Root Access (All 31 Screens)</span>
                                <ExternalLink className="h-3 w-3 opacity-60 group-hover/badge:opacity-100 transition" />
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3 shrink-0" />
                                <span>{grantedCount} / {AVAILABLE_SCREENS.length} Screens Assigned</span>
                                <ExternalLink className="h-3 w-3 opacity-60 group-hover/badge:opacity-100 transition" />
                              </>
                            )}
                          </button>
                        </td>

                        {/* Direct Quick Action Buttons */}
                        <td className={`${adminTableBodyCellClass} text-right`}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Eye Icon Button: Direct navigation to dedicated page /admins/[id] */}
                            <button
                              type="button"
                              onClick={() => router.push(`/admins/${admin._id}`)}
                              className="p-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition cursor-pointer"
                              title="Inspect Workstations & Audit (Full Page)"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Edit Icon Button: Direct navigation to edit page /admins/edit/[id] */}
                            <button
                              type="button"
                              onClick={() => router.push(`/admins/edit/${admin._id}`)}
                              className="p-2 text-pink-500 hover:bg-pink-500/10 rounded-xl transition cursor-pointer"
                              title="Edit Profile & Workstations"
                            >
                              <Edit size={16} />
                            </button>

                            {/* Delete Account */}
                            {!isSelf ? (
                              <button
                                type="button"
                                onClick={() => triggerDelete(admin)}
                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                                title="Delete Staff Account"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : (
                              <span
                                className="p-2 text-slate-300 dark:text-slate-700 opacity-40 cursor-not-allowed"
                                title="Cannot delete active session"
                              >
                                <Trash2 size={16} />
                              </span>
                            )}

                            {/* Kebab Dropdown Menu */}
                            <div className="relative inline-flex" data-row-action>
                              <button
                                type="button"
                                onClick={() => setOpenMenuId(openMenuId === admin._id ? null : admin._id)}
                                className="p-2 text-slate-400 hover:text-foreground transition rounded-xl"
                              >
                                <MoreHorizontal size={18} />
                              </button>

                              {openMenuId === admin._id && (
                                <div className={rowActionDropdownClass}>
                                  <button
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl transition"
                                    onClick={() => router.push(`/admins/${admin._id}`)}
                                  >
                                    <Eye size={14} />
                                    Workstations Audit Page
                                  </button>
                                  <button
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-foreground hover:bg-hover-theme rounded-xl transition"
                                    onClick={() => router.push(`/admins/edit/${admin._id}`)}
                                  >
                                    <Edit size={14} />
                                    Edit Workstations Page
                                  </button>
                                  {!isSelf && (
                                    <button
                                      className="w-full text-left px-4 py-2.5 text-xs text-rose-500 font-bold hover:bg-rose-500/10 rounded-xl flex items-center gap-3 transition"
                                      onClick={() => triggerDelete(admin)}
                                    >
                                      <Trash2 size={14} />
                                      Delete Account
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="p-6 border-t border-border-theme bg-card flex items-center justify-between">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
              Showing {(params.page - 1) * 10 + Math.min(1, admins.length)}-{Math.min(params.page * 10, total)} of {total}
            </div>
            <Pagination currentPage={params.page} totalPages={totalPages} onPageChange={onPageChange} />
          </div>

          <DeleteModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Staff Account"
            itemName={adminToDelete?.name}
            isLoading={deleting}
          />
        </div>
      )}
    </div>
  );
}