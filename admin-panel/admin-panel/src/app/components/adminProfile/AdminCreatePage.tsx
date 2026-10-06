"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  ShieldCheck,
  Layers,
  Search,
  Check,
  CheckCheck,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  X,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import * as service from "../../services/adminService";
import {
  AVAILABLE_SCREENS,
  getDefaultPermissionsForRole,
  ROLES_CONFIG,
} from "../../utils/rbacConfig";

const CATEGORIES = [
  "Workspace",
  "Catalog",
  "Sales & Fleet",
  "Growth & CRM",
  "Storefront & System",
] as const;

export default function AdminCreatePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "kitchen_manager",
    city: "Faridabad Hub",
    permissions: getDefaultPermissionsForRole("kitchen_manager"),
  });

  const handleRoleChange = (newRole: string) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: getDefaultPermissionsForRole(newRole),
    }));
  };

  const toggleScreen = (route: string) => {
    setFormData((prev) => {
      const perms = prev.permissions.includes("*")
        ? AVAILABLE_SCREENS.map((s) => s.route)
        : [...prev.permissions];
      const exists = perms.includes(route);
      return {
        ...prev,
        permissions: exists ? perms.filter((r) => r !== route) : [...perms, route],
      };
    });
  };

  const isScreenAllowed = (route: string) => {
    if (formData.role === "super_admin" || formData.role === "admin") return true;
    if (formData.permissions.includes("*")) return true;
    return formData.permissions.includes(route);
  };

  const handleGrantAll = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: AVAILABLE_SCREENS.map((s) => s.route),
    }));
    showToast("All 31 system workstations granted to this account", "info");
  };

  const handleResetDefaults = () => {
    const defaults = getDefaultPermissionsForRole(formData.role);
    setFormData((prev) => ({
      ...prev,
      permissions: defaults,
    }));
    showToast(`Reset to ${ROLES_CONFIG[formData.role]?.name || formData.role} standard defaults`, "info");
  };

  const handleToggleCategory = (cat: string, selectAll: boolean) => {
    const catScreens = AVAILABLE_SCREENS.filter((s) => s.category === cat).map((s) => s.route);
    setFormData((prev) => {
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

  const grantedCount =
    formData.role === "super_admin" || formData.role === "admin" || formData.permissions.includes("*")
      ? AVAILABLE_SCREENS.length
      : formData.permissions.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      showToast("Please fill all required profile fields", "error");
      return;
    }

    if (formData.password.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return;
    }

    setLoading(true);
    try {
      await service.registerAdmin(formData);
      showToast(`Staff account successfully created for ${formData.name}!`, "success");
      router.push("/admins");
    } catch (err: any) {
      showToast(
        err.response?.data?.message || err.message || "Failed to create staff account",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const roleInfo = ROLES_CONFIG[formData.role] || ROLES_CONFIG.kitchen_manager;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb Navigation & Top Action Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border-theme bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/admins")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-theme bg-background text-slate-500 hover:text-foreground hover:bg-hover-theme transition cursor-pointer"
            title="Back to Admin Accounts"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
              <span
                onClick={() => router.push("/admins")}
                className="hover:text-pink-500 transition cursor-pointer"
              >
                Team Accounts
              </span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-pink-500">Register Staff Member</span>
            </div>
            <h1 className="text-xl font-black text-foreground sm:text-2xl">
              Create New Staff Account & Assign Workstations
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set up account login credentials and grant access only to allowed dashboard screens.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admins")}
            className="rounded-2xl border border-border-theme bg-background px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl bg-pink-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-500/25 hover:bg-pink-600 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Staff Account</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Workstations Checklist (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Account Credentials & Hub */}
          <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-border-theme pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">1. Account Profile & Credentials</h3>
                <p className="text-xs text-slate-400">Staff identity and login credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Staff Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Ramesh Kumar or Sunil Sharma"
                    className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Work Email (Login ID) *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. ramesh.chef@giftfestive.com"
                    className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Account Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-10 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Operating Branch / Hub</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Faridabad Hub or Noida Kitchen"
                    className="w-full rounded-2xl border border-border-theme bg-background pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Department Role Selection */}
          <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border-theme pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">2. Department Role Preset</h3>
                <p className="text-xs text-slate-400">
                  Selecting a role automatically loads recommended default workstation screens
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  id: "kitchen_manager",
                  title: "Kitchen Manager",
                  emoji: "👨‍🍳",
                  dept: "Bakery & Kitchen",
                  desc: "Orders dispatch board, cakes, flavors, addons & stock",
                  border: "hover:border-orange-500",
                  activeBg: "bg-orange-500/10 border-orange-500 text-orange-500",
                },
                {
                  id: "delivery_coordinator",
                  title: "Fleet Coordinator",
                  emoji: "🛵",
                  dept: "Logistics Fleet",
                  desc: "Delivery fleet riders, operating slots, cutoff hours & cities",
                  border: "hover:border-blue-500",
                  activeBg: "bg-blue-500/10 border-blue-500 text-blue-500",
                },
                {
                  id: "support_agent",
                  title: "Support Agent",
                  emoji: "🎧",
                  dept: "Customer Experience",
                  desc: "Abandoned carts recovery, customer inquiries & reviews",
                  border: "hover:border-cyan-500",
                  activeBg: "bg-cyan-500/10 border-cyan-500 text-cyan-500",
                },
                {
                  id: "seo_specialist",
                  title: "SEO Specialist",
                  emoji: "📈",
                  dept: "Growth & Marketing",
                  desc: "SEO suite, theme branding studio, coupons & hero slides",
                  border: "hover:border-purple-500",
                  activeBg: "bg-purple-500/10 border-purple-500 text-purple-500",
                },
                {
                  id: "super_admin",
                  title: "Super Admin",
                  emoji: "👑",
                  dept: "Executive Management",
                  desc: "Full unrestricted root access across all 31 modules & system configs",
                  border: "hover:border-pink-500",
                  activeBg: "bg-pink-500/10 border-pink-500 text-pink-500",
                },
              ].map((role) => {
                const isSelected = formData.role === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleChange(role.id)}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${role.border} ${
                      isSelected
                        ? `${role.activeBg} shadow-sm ring-2 ring-pink-500/20`
                        : "bg-background/60 border-border-theme/70 text-slate-500 hover:text-foreground hover:bg-hover-theme"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{role.emoji}</span>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-foreground">{role.title}</h4>
                      <p className="text-[10px] text-pink-500 font-semibold">{role.dept}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {role.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Screen Workstation Access Checklist */}
          <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-theme pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">3. Assigned Workstations & Screens</h3>
                  <p className="text-xs text-slate-400">
                    Check the exact screens this account can access. Unchecked pages will be hidden and blocked (403).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                  {grantedCount} / {AVAILABLE_SCREENS.length} Screens Selected
                </span>

                {formData.role !== "super_admin" && (
                  <>
                    <button
                      type="button"
                      onClick={handleGrantAll}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-pink-500 text-white hover:bg-pink-600 transition cursor-pointer"
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
                  </>
                )}
              </div>
            </div>

            {formData.role === "super_admin" ? (
              <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-600 dark:text-pink-400 font-medium flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 shrink-0" />
                <div>
                  <p className="font-bold text-sm">👑 Super Admin Root Privilege</p>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                    Super Admins always have unrestricted access to all 31 screens, including theme branding customizer, financial audit logs, and account management.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search & Category Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-background/50 p-2.5 rounded-2xl border border-border-theme">
                  <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        selectedCategory === "all"
                          ? "bg-pink-500 text-white shadow-2xs"
                          : "text-slate-400 hover:text-foreground"
                      }`}
                    >
                      All ({AVAILABLE_SCREENS.length})
                    </button>
                    {CATEGORIES.map((cat) => {
                      const count = AVAILABLE_SCREENS.filter((s) => s.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                            selectedCategory === cat
                              ? "bg-pink-500 text-white shadow-2xs"
                              : "text-slate-400 hover:text-foreground"
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>

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

                {/* Categorized Screens */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto p-1 pr-2">
                  {CATEGORIES.map((cat) => {
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
                                    : "bg-card/40 border-border-theme/60 text-slate-400 hover:text-foreground"
                                }`}
                              >
                                <div
                                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition ${
                                    allowed
                                      ? "bg-pink-500 border-pink-500 text-white"
                                      : "border-slate-400 bg-background"
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
        </div>

        {/* Right Column: Sticky Live Preview & Action Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 sticky top-6">
          {/* Card: Live Access Summary */}
          <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white text-lg font-black shadow-md shadow-pink-500/20">
                {formData.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-foreground truncate">
                  {formData.name || "New Staff Member"}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  {formData.email || "email@domain.com"}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border-theme">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Assigned Role:</span>
                <span className="text-foreground">{roleInfo?.name || formData.role}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Department:</span>
                <span className="text-pink-500">{roleInfo?.department || "Operations"}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Hub Branch:</span>
                <span className="text-foreground">{formData.city || "Faridabad Hub"}</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Workstation Coverage:</span>
                  <span className="text-pink-500 font-black">
                    {grantedCount} / {AVAILABLE_SCREENS.length} Screens ({Math.round((grantedCount / AVAILABLE_SCREENS.length) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-border-theme overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round((grantedCount / AVAILABLE_SCREENS.length) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="p-4 rounded-2xl bg-background/80 border border-border-theme text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>Strict Enterprise RBAC Active</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                This account will only be able to view and access the {grantedCount} assigned screens. All other pages will be completely hidden from their sidebar and blocked with 403 Forbidden.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:bg-pink-600 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Create Staff Account</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/admins")}
                className="w-full rounded-2xl border border-border-theme bg-background px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition cursor-pointer text-center"
              >
                Cancel & Return
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
