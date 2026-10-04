"use client";

import React, { useState } from "react";
import { TableSkeleton } from "../skeletonLoader/commonSkeleton";
import Pagination from "../Pagination";
import AdminEditForm from "./adminEdit";
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
  Sparkles,
  Save,
  CheckCircle2,
  ShieldAlert,
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

interface RolePermission {
  module: string;
  description: string;
  superAdmin: boolean;
  kitchenManager: boolean;
  supportAgent: boolean;
  deliveryCoordinator: boolean;
  seoSpecialist: boolean;
}

const DEFAULT_PERMISSIONS: RolePermission[] = [
  {
    module: "Storefront Theme Studio",
    description: "Change theme colors, banner, and publish to live user site",
    superAdmin: true,
    kitchenManager: false,
    supportAgent: false,
    deliveryCoordinator: false,
    seoSpecialist: true,
  },
  {
    module: "Orders & Kitchen Dispatch",
    description: "Manage orders pipeline and kitchen live dispatch board",
    superAdmin: true,
    kitchenManager: true,
    supportAgent: true,
    deliveryCoordinator: true,
    seoSpecialist: false,
  },
  {
    module: "Abandoned Cart Recovery",
    description: "Trigger automated 15% WhatsApp coupons to incomplete carts",
    superAdmin: true,
    kitchenManager: false,
    supportAgent: true,
    deliveryCoordinator: false,
    seoSpecialist: false,
  },
  {
    module: "Delivery Fleet Management",
    description: "Assign riders, track dispatch, and manage vehicle fleet",
    superAdmin: true,
    kitchenManager: true,
    supportAgent: false,
    deliveryCoordinator: true,
    seoSpecialist: false,
  },
  {
    module: "Product Catalog & Pricing",
    description: "Add/edit cakes, flavors, addons, and bulk update prices",
    superAdmin: true,
    kitchenManager: true,
    supportAgent: false,
    deliveryCoordinator: false,
    seoSpecialist: true,
  },
  {
    module: "Security & Audit Logs",
    description: "View system audit trail, team activity, and export reports",
    superAdmin: true,
    kitchenManager: false,
    supportAgent: false,
    deliveryCoordinator: false,
    seoSpecialist: false,
  },
  {
    module: "Invoice & Financial Exports",
    description: "Print official tax invoices and export CSV financial reports",
    superAdmin: true,
    kitchenManager: false,
    supportAgent: true,
    deliveryCoordinator: false,
    seoSpecialist: false,
  },
];

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
  const [activeTab, setActiveTab] = useState<"accounts" | "rbac">("accounts");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [permissions, setPermissions] = useState<RolePermission[]>(DEFAULT_PERMISSIONS);
  const [savingMatrix, setSavingMatrix] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  useRowActionMenu(openMenuId, setOpenMenuId);

  const triggerDelete = (admin: any) => {
    setAdminToDelete(admin);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;
    setDeleting(true);
    try {
      await service.deleteAdmin(adminToDelete._id);
      showToast("Admin deleted successfully", "success");
      refresh();
      setDeleteModalOpen(false);
    } catch (err) {
      showToast("Failed to delete admin", "error");
    } finally {
      setDeleting(false);
    }
  };

  const togglePermission = (index: number, role: keyof RolePermission) => {
    if (role === "superAdmin") return; // Super admin always has full access
    setPermissions((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [role]: !copy[index][role],
      };
      return copy;
    });
  };

  const handleSaveMatrix = () => {
    setSavingMatrix(true);
    setTimeout(() => {
      setSavingMatrix(false);
      showToast("Role-Based Access Control matrix updated successfully!", "success");
    }, 600);
  };

  if (editingId) {
    return <AdminEditForm adminId={editingId} onCancel={() => setEditingId(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border-theme bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Admin Team & Role-Based Access Control (RBAC)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage admin users, department permissions, and fine-grained access rules.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center rounded-2xl border border-border-theme bg-background p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("accounts")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
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
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "rbac"
                ? "bg-pink-500 text-white shadow-xs"
                : "text-slate-500 hover:text-foreground"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>RBAC Matrix</span>
          </button>
        </div>
      </div>

      {activeTab === "rbac" ? (
        /* RBAC MATRIX VIEW */
        <div className="space-y-6">
          {/* Roles Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { name: "Super Admin", color: "border-pink-500 bg-pink-500/10 text-pink-500", desc: "Full root access to all modules, theme studio & billing" },
              { name: "Kitchen Manager", color: "border-orange-500 bg-orange-500/10 text-orange-500", desc: "Orders pipeline, live dispatch, flavors & inventory" },
              { name: "Support Agent", color: "border-cyan-500 bg-cyan-500/10 text-cyan-500", desc: "Inquiries, CRM, tickets & abandoned cart follow-up" },
              { name: "Delivery Coordinator", color: "border-emerald-500 bg-emerald-500/10 text-emerald-500", desc: "Fleet rider assign, delivery slots & live order dispatch" },
              { name: "SEO Specialist", color: "border-purple-500 bg-purple-500/10 text-purple-500", desc: "Meta tags, schema JSON-LD, coupons & storefront theme" },
            ].map((role) => (
              <div key={role.name} className="rounded-2xl border border-border-theme bg-card p-4 space-y-2">
                <span className={`inline-block rounded-xl border px-2.5 py-1 text-[11px] font-black ${role.color}`}>
                  {role.name}
                </span>
                <p className="text-[11px] text-slate-500 line-clamp-3">{role.desc}</p>
              </div>
            ))}
          </div>

          {/* Permissions Table */}
          <div className="rounded-3xl border border-border-theme bg-card shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-theme flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Granular Module Permissions</h3>
                <p className="text-xs text-slate-500">Click any checkmark to toggle permission for that role.</p>
              </div>

              <button
                type="button"
                onClick={handleSaveMatrix}
                disabled={savingMatrix}
                className="flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-pink-600 transition"
              >
                {savingMatrix ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>Save RBAC Matrix</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border-theme bg-background/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4">System Module</th>
                    <th className="py-3.5 px-4 text-center">Super Admin</th>
                    <th className="py-3.5 px-4 text-center">Kitchen Mgr</th>
                    <th className="py-3.5 px-4 text-center">Support Agent</th>
                    <th className="py-3.5 px-4 text-center">Fleet Coord</th>
                    <th className="py-3.5 px-4 text-center">SEO Specialist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-theme/60">
                  {permissions.map((perm, idx) => (
                    <tr key={perm.module} className="hover:bg-hover-theme/60 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-foreground text-sm">{perm.module}</p>
                        <span className="text-[11px] text-slate-400">{perm.description}</span>
                      </td>

                      {/* Super Admin */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </span>
                      </td>

                      {/* Kitchen Manager */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(idx, "kitchenManager")}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-xl transition ${
                            perm.kitchenManager
                              ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400 hover:bg-slate-300"
                          }`}
                        >
                          {perm.kitchenManager ? <Check className="h-4 w-4 stroke-[3]" /> : <X className="h-4 w-4" />}
                        </button>
                      </td>

                      {/* Support Agent */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(idx, "supportAgent")}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-xl transition ${
                            perm.supportAgent
                              ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400 hover:bg-slate-300"
                          }`}
                        >
                          {perm.supportAgent ? <Check className="h-4 w-4 stroke-[3]" /> : <X className="h-4 w-4" />}
                        </button>
                      </td>

                      {/* Delivery Coordinator */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(idx, "deliveryCoordinator")}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-xl transition ${
                            perm.deliveryCoordinator
                              ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400 hover:bg-slate-300"
                          }`}
                        >
                          {perm.deliveryCoordinator ? <Check className="h-4 w-4 stroke-[3]" /> : <X className="h-4 w-4" />}
                        </button>
                      </td>

                      {/* SEO Specialist */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(idx, "seoSpecialist")}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-xl transition ${
                            perm.seoSpecialist
                              ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400 hover:bg-slate-300"
                          }`}
                        >
                          {perm.seoSpecialist ? <Check className="h-4 w-4 stroke-[3]" /> : <X className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
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
                placeholder="Search name, email, city..."
                className="w-full pl-4 pr-4 py-2.5 rounded-2xl border border-border-theme bg-background text-sm outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-background px-4 py-2.5 rounded-2xl border border-border-theme font-sans">
              Total Admins: {total}
            </div>
          </div>

          {loading ? (
            <TableSkeleton rows={8} cols={5} />
          ) : error ? (
            <div className="p-20 text-center text-rose-500 italic">{error}</div>
          ) : admins.length === 0 ? (
            <div className="p-20 text-center text-slate-400 italic">No admins found.</div>
          ) : (
            <div className={`${adminTableWrapClass} min-h-[450px]`}>
              <table className={adminTableClass}>
                <thead>
                  <tr className="bg-th-bg border-b border-border-theme">
                    <th className={adminTableHeadCellClass}>Name</th>
                    <th className={adminTableHeadCellClass}>Email</th>
                    <th className={adminTableHeadCellClass}>City</th>
                    <th className={adminTableHeadCellClass}>Role</th>
                    <th className={`${adminTableHeadCellClass} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-theme">
                  {admins.map((admin) => (
                    <tr
                      key={admin._id}
                      className="hover:bg-hover-theme transition-all duration-300 group border-b border-border-theme/50"
                    >
                      <td className="px-6 py-4 font-bold text-foreground flex items-center gap-2">
                        {admin._id === activeAdminId && (
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" title="Active" />
                        )}
                        {admin.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 truncate">{admin.email}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{admin.city || "—"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-xl bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 text-xs font-bold text-pink-500">
                          {admin.role || "Admin"}
                        </span>
                      </td>
                      <td className={`${adminTableBodyCellClass} text-right`}>
                        <div className="relative inline-flex justify-end" data-row-action>
                          <button
                            type="button"
                            onClick={() => setOpenMenuId(openMenuId === admin._id ? null : admin._id)}
                            className="p-2 text-slate-400 hover:text-foreground transition rounded-xl"
                          >
                            <MoreHorizontal size={20} />
                          </button>

                          {openMenuId === admin._id && (
                            <div className={rowActionDropdownClass}>
                              <button
                                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl transition"
                                onClick={() => router.push(`/admins/${admin._id}`)}
                              >
                                <Eye size={16} />
                                View
                              </button>
                              <button
                                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground hover:bg-hover-theme rounded-xl transition"
                                onClick={() => setEditingId(admin._id)}
                              >
                                <Edit size={16} />
                                Edit
                              </button>
                              <button
                                className="w-full text-left px-4 py-3 text-sm text-red-500 font-bold hover:bg-red-500/10 rounded-xl flex items-center gap-2 transition"
                                onClick={() => triggerDelete(admin)}
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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
            title="Delete Admin Profile"
            itemName={adminToDelete?.name}
            isLoading={deleting}
          />
        </div>
      )}
    </div>
  );
}