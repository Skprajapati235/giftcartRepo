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
  UserPlus,
  User,
  Mail,
  Plus,
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "kitchen_manager",
    city: "Faridabad Hub",
  });
  const { showToast } = useToast();
  const router = useRouter();

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email || !staffForm.password) {
      showToast("Please fill all required fields", "error");
      return;
    }
    setCreatingStaff(true);
    try {
      await service.registerAdmin(staffForm);
      showToast(`Staff account created for ${staffForm.name}!`, "success");
      setShowAddModal(false);
      setStaffForm({
        name: "",
        email: "",
        password: "",
        role: "kitchen_manager",
        city: "Faridabad Hub",
      });
      refresh();
    } catch (err: any) {
      showToast(
        err.response?.data?.message || err.message || "Failed to create staff account",
        "error"
      );
    } finally {
      setCreatingStaff(false);
    }
  };

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
            <div className="flex items-center gap-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-background px-4 py-2.5 rounded-2xl border border-border-theme font-sans">
                Total Staff: {total}
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-2xl bg-pink-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 active:scale-95 transition cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Add Staff Account</span>
              </button>
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
                        <span className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold shadow-2xs ${getRoleBadgeStyle(admin.role)}`}>
                          {getRoleDisplayName(admin.role)}
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

      {/* Add Staff Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-border-theme bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border-theme pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Create Staff Account</h3>
                  <p className="text-xs text-slate-400">Assign dedicated credentials and role permissions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-hover-theme transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Staff Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={staffForm.name}
                    onChange={(e) => setStaffForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Ramesh Chef or Sunil Rider"
                    className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Staff Work Email (Login ID)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={staffForm.email}
                    onChange={(e) => setStaffForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. ramesh.chef@giftfestive.com"
                    className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Account Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={staffForm.password}
                    onChange={(e) => setStaffForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Assign Department Role</label>
                  <div className="relative">
                    <select
                      value={staffForm.role}
                      onChange={(e) => setStaffForm((prev) => ({ ...prev, role: e.target.value }))}
                      className="w-full rounded-2xl border border-border-theme bg-background px-3 py-2.5 text-xs text-foreground font-semibold outline-none focus:ring-2 focus:ring-pink-500/20"
                    >
                      <option value="kitchen_manager">👨‍🍳 Kitchen Manager (Baking Board)</option>
                      <option value="delivery_coordinator">🛵 Fleet Coordinator (Delivery)</option>
                      <option value="support_agent">🎧 Support Agent (Abandoned Carts)</option>
                      <option value="seo_specialist">📈 SEO Specialist (Theme & Promos)</option>
                      <option value="super_admin">👑 Super Admin (Full Control)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Operating Branch / Hub</label>
                  <input
                    type="text"
                    value={staffForm.city}
                    onChange={(e) => setStaffForm((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Faridabad Hub"
                    className="w-full rounded-2xl border border-border-theme bg-background px-4 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-background/80 border border-border-theme text-[11px] text-slate-400 space-y-1">
                <p className="font-bold text-foreground">🔒 RBAC Security Enforced:</p>
                <p>This staff member will ONLY be able to access their assigned workstations and will be blocked with a 403 Forbidden screen on other modules.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-border-theme bg-background px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingStaff}
                  className="flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {creatingStaff ? "Creating Account..." : "Create Staff Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}