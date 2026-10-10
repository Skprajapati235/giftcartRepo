"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAdmin } from "../../context/AdminContext";
import {
  ShieldCheck,
  UserCheck,
  MapPin,
  Mail,
  User,
  Lock,
  Check,
  Search,
  CheckCheck,
  RotateCcw,
  Sparkles,
  Layers,
  X,
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import {
  AVAILABLE_SCREENS,
  getDefaultPermissionsForRole,
  ROLES_CONFIG,
} from "../../utils/rbacConfig";

interface AdminEditFormProps {
  adminId: string;
  onCancel: () => void;
}

export default function AdminEditForm({ adminId, onCancel }: AdminEditFormProps) {
  const { admins, updateAdmin } = useAdmin();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [values, setValues] = useState({
    name: "",
    email: "",
    city: "",
    role: "kitchen_manager",
    permissions: [] as string[],
  });

  useEffect(() => {
    const admin = admins.find((a) => a._id === adminId);
    if (admin) {
      const initialPerms =
        Array.isArray(admin.permissions)
          ? admin.permissions
          : getDefaultPermissionsForRole(admin.role || "kitchen_manager");

      setValues({
        name: admin.name || "",
        email: admin.email || "",
        city: admin.city || "",
        role: admin.role || "kitchen_manager",
        permissions: initialPerms,
      });
    }
  }, [admins, adminId]);

  const handleRoleChange = (newRole: string) => {
    setValues((prev) => ({
      ...prev,
      role: newRole,
      permissions: getDefaultPermissionsForRole(newRole),
    }));
  };

  const toggleScreen = (route: string) => {
    setValues((prev) => {
      const perms = prev.permissions.includes("*")
        ? AVAILABLE_SCREENS.map((s) => s.route)
        : [...prev.permissions];
      const exists = perms.includes(route);
      const nextPerms = exists ? perms.filter((r) => r !== route) : [...perms, route];
      return {
        ...prev,
        permissions: nextPerms,
      };
    });
  };

  const isScreenAllowed = (route: string) => {
    if (values.role === "super_admin" || values.role === "admin") return true;
    if (values.permissions.includes("*")) return true;
    return values.permissions.includes(route);
  };

  const handleGrantAll = () => {
    setValues((prev) => ({
      ...prev,
      permissions: AVAILABLE_SCREENS.map((s) => s.route),
    }));
    showToast("All 31 workstations granted to this account!", "info");
  };

  const handleResetDefaults = () => {
    const defaults = getDefaultPermissionsForRole(values.role);
    setValues((prev) => ({
      ...prev,
      permissions: defaults,
    }));
    showToast(`Reset to ${ROLES_CONFIG[values.role]?.name || values.role} standard defaults`, "info");
  };

  const handleClearAll = () => {
    setValues((prev) => ({
      ...prev,
      permissions: [],
    }));
    showToast("Cleared all screens. Now select only the workstations to assign.", "info");
  };

  const handleToggleCategory = (cat: string, selectAll: boolean) => {
    const catScreens = AVAILABLE_SCREENS.filter((s) => s.category === cat).map((s) => s.route);
    setValues((prev) => {
      const current = prev.permissions.includes("*")
        ? AVAILABLE_SCREENS.map((s) => s.route)
        : [...prev.permissions];
      let updated: string[];
      if (selectAll) {
        updated = Array.from(new Set([...current, ...catScreens]));
      } else {
        updated = current.filter((r) => !catScreens.includes(r));
      }
      return {
        ...prev,
        permissions: updated,
      };
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await updateAdmin(adminId, values);
      showToast("Staff profile & assigned screens updated successfully!", "success");
      onCancel();
    } catch (err: any) {
      showToast(err.message || "Failed to update admin profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    "Workspace",
    "Catalog",
    "Sales & Fleet",
    "Growth & CRM",
    "Storefront & System",
  ] as const;

  const filteredScreens = useMemo(() => {
    return AVAILABLE_SCREENS.filter((screen) => {
      const matchCat = selectedCategory === "all" || screen.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        screen.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        screen.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
        screen.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const totalAssignedCount =
    values.role === "super_admin" || values.role === "admin" || values.permissions.includes("*")
      ? AVAILABLE_SCREENS.length
      : values.permissions.length;

  return (
    <div className="mt-6 p-6 rounded-3xl bg-card border border-border-theme shadow-sm max-w-5xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-theme pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20 shadow-xs">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-foreground">Edit Staff Profile & Workstations</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20">
                Enterprise RBAC
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Fine-tune name, department role, and exact screen permissions. Unchecked screens are strictly blocked.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border-theme bg-background px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveEdit}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>

      {/* Account Info Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">Staff Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={values.name}
              onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full Name"
              className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">Work Email (Login ID)</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={values.email}
              onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email address"
              className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">Assigned Department Role</label>
          <div className="relative">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
            <select
              value={values.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground font-semibold outline-none focus:ring-2 focus:ring-pink-500/20"
            >
              <option value="kitchen_manager">👨‍🍳 Kitchen Manager (Baking Board, Flavors, Stock)</option>
              <option value="delivery_coordinator">🛵 Fleet Coordinator (Delivery Riders & Dispatch)</option>
              <option value="support_agent">🎧 Support Agent (Abandoned Carts, CRM & Inquiries)</option>
              <option value="seo_specialist">📈 SEO Specialist (Storefront Theme, Meta & Promos)</option>
              <option value="super_admin">👑 Super Admin (Full Root Access to All 31 Screens)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">City / Operating Hub</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={values.city}
              onChange={(e) => setValues((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="e.g. Faridabad Hub"
              className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>
        </div>
      </div>

      {/* Screen Assignment Matrix */}
      <div className="border-t border-border-theme pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-pink-500" />
              <h3 className="text-sm font-black text-foreground">Screen & Workstation Access Permissions</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Check workstations this account can access. Unchecked pages will be hidden and return 403 Forbidden.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
              {totalAssignedCount} / {AVAILABLE_SCREENS.length} Screens Granted
            </span>

            {values.role !== "super_admin" && values.role !== "admin" && (
              <>
                <button
                  type="button"
                  onClick={handleGrantAll}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-pink-500 text-white hover:bg-pink-600 transition shadow-2xs cursor-pointer"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Grant All</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border border-border-theme bg-background hover:bg-hover-theme transition text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Role Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition text-rose-500 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </button>
              </>
            )}
          </div>
        </div>

        {values.role === "super_admin" || values.role === "admin" ? (
          <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-600 dark:text-pink-400 font-medium flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">👑 Super Admin Root Privilege</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Super Admins automatically have unrestricted root access to all 31 system workstations, theme studio, security audit trails, and administrative APIs.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Filter and Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-background/50 p-2.5 rounded-2xl border border-border-theme">
              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-pink-500 text-white"
                      : "text-slate-400 hover:text-foreground"
                  }`}
                >
                  All ({AVAILABLE_SCREENS.length})
                </button>
                {categories.map((cat) => {
                  const count = AVAILABLE_SCREENS.filter((s) => s.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-pink-500 text-white"
                          : "text-slate-400 hover:text-foreground"
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-56 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter screens..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border-theme bg-background text-xs outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>
            </div>

            {/* Categorized Screen Grid */}
            <div className="space-y-4 max-h-[440px] overflow-y-auto p-1 pr-2">
              {categories.map((cat) => {
                const screensInCat = filteredScreens.filter((s) => s.category === cat);
                if (screensInCat.length === 0) return null;

                const allInCatSelected = screensInCat.every((s) => isScreenAllowed(s.route));
                const countSelected = screensInCat.filter((s) => isScreenAllowed(s.route)).length;

                return (
                  <div
                    key={cat}
                    className="rounded-2xl border border-border-theme bg-card/50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-border-theme/60 pb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                          {cat}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 bg-background px-2 py-0.5 rounded-full border border-border-theme">
                          {countSelected} / {screensInCat.length} Active
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(cat, true)}
                          disabled={allInCatSelected}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-border-theme hover:bg-hover-theme transition disabled:opacity-30 cursor-pointer"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(cat, false)}
                          disabled={countSelected === 0}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-border-theme hover:bg-hover-theme transition disabled:opacity-30 cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {screensInCat.map((screen) => {
                        const allowed = isScreenAllowed(screen.route);
                        return (
                          <button
                            key={screen.route}
                            type="button"
                            onClick={() => toggleScreen(screen.route)}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition cursor-pointer ${
                              allowed
                                ? "bg-pink-500/10 border-pink-500/35 text-foreground shadow-2xs"
                                : "bg-card/40 border-border-theme/60 text-slate-400 hover:text-foreground hover:border-border-theme"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition ${
                                allowed ? "bg-pink-500 border-pink-500 text-white" : "border-slate-400 bg-background"
                              }`}
                            >
                              {allowed && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold leading-tight truncate">{screen.label}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                                {screen.route}
                              </p>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                Dept: {screen.department}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-theme">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border-theme bg-background px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={saveEdit}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-pink-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 active:scale-95 transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving Changes..." : "Save Workstation Permissions"}
        </button>
      </div>
    </div>
  );
}