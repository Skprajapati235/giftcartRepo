"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAdmin } from "../../../context/AdminContext";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../../context/ToastContext";
import AdminEditForm from "../adminEdit";
import DeleteModal from "../../ui/DeleteModal";
import * as service from "../../../services/adminService";
import {
  ShieldCheck,
  UserCheck,
  MapPin,
  Mail,
  User,
  Lock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Search,
  Check,
  X,
} from "lucide-react";
import {
  AVAILABLE_SCREENS,
  ROLES_CONFIG,
  getDefaultPermissionsForRole,
} from "../../../utils/rbacConfig";

const CATEGORIES = [
  "Workspace",
  "Catalog",
  "Sales & Fleet",
  "Growth & CRM",
  "Storefront & System",
] as const;

export default function AdminDetails() {
  const router = useRouter();
  const params = useParams();
  const { admins, deleteAdmin } = useAdmin();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [admin, setAdmin] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter and search state
  const [screenFilter, setScreenFilter] = useState<"all" | "granted" | "restricted">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const adminId = params.id as string;

  useEffect(() => {
    let isMounted = true;

    const resolveAdmin = async () => {
      // 1. Check if present in context
      const found = admins.find((a) => a._id === adminId);
      if (found) {
        if (isMounted) {
          setAdmin(found);
          setFetching(false);
        }
        return;
      }

      // 2. Fallback to API fetch
      try {
        const res = await service.getAdmins({ limit: 100 });
        const list = res?.data || res?.admins || [];
        const match = list.find((a: any) => a._id === adminId);
        if (match && isMounted) {
          setAdmin(match);
        } else if (isMounted) {
          showToast("Admin account not found", "error");
          router.push("/admins");
        }
      } catch (err) {
        if (isMounted) {
          showToast("Failed to fetch admin details", "error");
          router.push("/admins");
        }
      } finally {
        if (isMounted) setFetching(false);
      }
    };

    if (adminId) {
      resolveAdmin();
    }

    return () => {
      isMounted = false;
    };
  }, [adminId, admins, router, showToast]);

  if (fetching || !admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
        <p className="text-xs font-bold text-slate-400">Loading workstation permissions audit...</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-foreground transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Workstations Inspection</span>
        </button>
        <AdminEditForm
          adminId={admin._id}
          onCancel={() => {
            setIsEditing(false);
            const updated = admins.find((a) => a._id === admin._id);
            if (updated) setAdmin(updated);
          }}
        />
      </div>
    );
  }

  const roleKey = (admin.role || "kitchen_manager").toLowerCase();
  const roleConfig = ROLES_CONFIG[roleKey] || ROLES_CONFIG.kitchen_manager;
  const isSuperAdmin = roleKey === "super_admin" || roleKey === "admin";

  const effectivePermissions =
    Array.isArray(admin.permissions) && admin.permissions.length > 0
      ? admin.permissions
      : getDefaultPermissionsForRole(admin.role);

  const isScreenGranted = (route: string) => {
    if (isSuperAdmin) return true;
    if (effectivePermissions.includes("*")) return true;
    return effectivePermissions.some((p: string) => {
      const cleanP = (p || "").toLowerCase().trim();
      const cleanRoute = (route || "").toLowerCase().trim();
      return cleanRoute === cleanP || cleanRoute.startsWith(cleanP + "/");
    });
  };

  const accessibleCount = isSuperAdmin
    ? AVAILABLE_SCREENS.length
    : AVAILABLE_SCREENS.filter((s) => isScreenGranted(s.route)).length;

  const coveragePercentage = Math.round((accessibleCount / AVAILABLE_SCREENS.length) * 100);

  const handleDelete = async () => {
    if (currentUser?._id === admin._id) {
      showToast("You cannot delete your own active Super Admin session", "error");
      return;
    }
    setDeleting(true);
    try {
      await deleteAdmin(admin._id);
      showToast("Staff account deleted successfully", "success");
      router.push("/admins");
    } catch (err: any) {
      showToast(err.message || "Failed to delete account", "error");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border-theme bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/admins")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-theme bg-background text-slate-500 hover:text-foreground hover:bg-hover-theme transition cursor-pointer"
            title="Back to Accounts"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white text-xl font-black shadow-md shadow-pink-500/20">
              {admin.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-0.5">
                <span
                  onClick={() => router.push("/admins")}
                  className="hover:text-pink-500 transition cursor-pointer"
                >
                  Team Accounts
                </span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-pink-500">Workstations Audit</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-foreground sm:text-2xl">{admin.name}</h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    roleConfig?.badgeColor || "bg-pink-500/10 text-pink-500 border-pink-500/20"
                  }`}
                >
                  <ShieldCheck className="h-3 w-3" />
                  <span>{roleConfig?.name || admin.role}</span>
                </span>
                {currentUser?._id === admin._id && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    You (Active Session)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {admin.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {admin.city || "Faridabad Hub"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-2xl bg-pink-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 active:scale-95 transition cursor-pointer"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile & Screens</span>
          </button>

          {currentUser?._id !== admin._id && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500 hover:text-white transition cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-border-theme bg-card p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Accessible Workstations</span>
            <Layers className="h-4 w-4 text-pink-500" />
          </div>
          <p className="text-2xl font-black text-foreground">
            {accessibleCount}{" "}
            <span className="text-xs font-semibold text-slate-400">/ {AVAILABLE_SCREENS.length} Screens</span>
          </p>
          <div className="w-full h-2 rounded-full bg-border-theme overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-full transition-all duration-300"
              style={{ width: `${coveragePercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-pink-500 font-bold">
            {isSuperAdmin ? "100% Full Unrestricted Coverage" : `${coveragePercentage}% Coverage Active`}
          </p>
        </div>

        <div className="rounded-3xl border border-border-theme bg-card p-5 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assigned Department</span>
            <UserCheck className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="text-base font-black text-foreground truncate">
            {admin.department || roleConfig?.department || "Operations"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {roleConfig?.description || "Workstation role permissions"}
          </p>
        </div>

        <div className="rounded-3xl border border-border-theme bg-card p-5 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Security Guard Level</span>
            <Lock className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-base font-black text-foreground">
            {isSuperAdmin ? "👑 Root Super Admin" : "🔒 Workstation Restricted"}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold leading-relaxed">
            {isSuperAdmin ? "Zero Restrictions (Master Access)" : "Unassigned screens blocked with 403 Forbidden"}
          </p>
        </div>

        <div className="rounded-3xl border border-border-theme bg-card p-5 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Account Information</span>
            <Calendar className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-base font-black text-foreground">
            {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "Active Member"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Operating Hub: {admin.city || "Faridabad Hub"}
          </p>
        </div>
      </div>

      {/* Complete Workstations & Permissions Inspection Grid */}
      <div className="rounded-3xl border border-border-theme bg-card shadow-sm overflow-hidden">
        {/* Inspection Header */}
        <div className="p-6 border-b border-border-theme flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h2 className="text-base font-black text-foreground">
                Workstation Screen Permissions Audit ({AVAILABLE_SCREENS.length} Total Screens)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live inspection of every screen in the system. The staff member can only access screens with{" "}
              <strong className="text-emerald-500 font-black">Access Granted</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search screen or route..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border-theme bg-background text-xs outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
          </div>
        </div>

        {/* Filter Pills Toolbar */}
        <div className="px-6 py-3 border-b border-border-theme bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setScreenFilter("all")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                screenFilter === "all"
                  ? "bg-pink-500 text-white shadow-2xs"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              All Screens ({AVAILABLE_SCREENS.length})
            </button>
            <button
              type="button"
              onClick={() => setScreenFilter("granted")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                screenFilter === "granted"
                  ? "bg-emerald-500 text-white shadow-2xs"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              Granted ({accessibleCount})
            </button>
            <button
              type="button"
              onClick={() => setScreenFilter("restricted")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                screenFilter === "restricted"
                  ? "bg-slate-700 text-white shadow-2xs"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              Restricted ({AVAILABLE_SCREENS.length - accessibleCount})
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-foreground text-background"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-foreground text-background"
                    : "text-slate-400 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Categorized Screens Grid */}
        <div className="p-6 space-y-6">
          {CATEGORIES.map((cat) => {
            const screensInCat = AVAILABLE_SCREENS.filter((s) => {
              const matchCat = selectedCategory === "all" || selectedCategory === cat;
              if (s.category !== cat || !matchCat) return false;
              const granted = isScreenGranted(s.route);
              const matchStatus =
                screenFilter === "all" ||
                (screenFilter === "granted" && granted) ||
                (screenFilter === "restricted" && !granted);
              const matchQuery =
                !searchQuery.trim() ||
                s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.department.toLowerCase().includes(searchQuery.toLowerCase());
              return matchStatus && matchQuery;
            });

            if (screensInCat.length === 0) return null;

            return (
              <div key={cat} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">{cat}</h3>
                  <span className="flex-1 h-px bg-border-theme/70" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {screensInCat.map((screen) => {
                    const granted = isScreenGranted(screen.route);

                    return (
                      <div
                        key={screen.route}
                        className={`p-3.5 rounded-2xl border transition flex items-start gap-3 ${
                          granted
                            ? "bg-emerald-500/5 border-emerald-500/25 shadow-2xs"
                            : "bg-background/40 border-border-theme/60 opacity-60"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                            granted
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400 border border-border-theme"
                          }`}
                        >
                          {granted ? <Check className="h-4 w-4 stroke-[3]" /> : <Lock className="h-3.5 w-3.5" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-foreground truncate">{screen.label}</p>
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0 ${
                                granted
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : "bg-slate-500/10 text-slate-400"
                              }`}
                            >
                              {granted ? "Granted" : "Restricted"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{screen.route}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            Dept: {screen.department}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Staff Account"
        itemName={admin.name}
        isLoading={deleting}
      />
    </div>
  );
}