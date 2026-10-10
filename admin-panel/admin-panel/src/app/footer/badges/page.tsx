"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import FooterNavTabs from "../../components/footer/FooterNavTabs";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Award,
  Heart,
  Truck,
  Shield,
  Star,
  Clock,
  Gift,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  X,
} from "lucide-react";

const ICON_OPTIONS = [
  { value: "award", label: "Award (Freshness)", icon: Award },
  { value: "heart", label: "Heart (Love/Blooms)", icon: Heart },
  { value: "truck", label: "Truck (Delivery/Slots)", icon: Truck },
  { value: "shield", label: "Shield (Security/Guarantee)", icon: Shield },
  { value: "star", label: "Star (Top Rated)", icon: Star },
  { value: "clock", label: "Clock (On Time)", icon: Clock },
  { value: "gift", label: "Gift (Surprise)", icon: Gift },
];

const PRESET_COLORS = ["#ffd166", "#D82B76", "#4ade80", "#38bdf8", "#a855f7", "#f97316", "#ffffff"];

export default function FooterBadgesPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<any[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [badgeForm, setBadgeForm] = useState({
    title: "",
    subtitle: "",
    icon: "award",
    color: "#ffd166",
    sortOrder: 1,
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await service.getFooterAdmin();
      if (res && res.data) {
        setBadges(res.data.trustBadges || []);
      }
    } catch (err: any) {
      showToast("Failed to load trust badges", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingBadge(null);
    setBadgeForm({
      title: "",
      subtitle: "",
      icon: "award",
      color: "#ffd166",
      sortOrder: badges.length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (badge: any) => {
    setEditingBadge(badge);
    setBadgeForm({
      title: badge.title || "",
      subtitle: badge.subtitle || "",
      icon: badge.icon || "award",
      color: badge.color || "#ffd166",
      sortOrder: badge.sortOrder || 1,
      isActive: badge.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSaveBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingBadge && editingBadge._id) {
        await service.updateFooterBadge(editingBadge._id, badgeForm);
        showToast("Trust badge updated successfully!", "success");
      } else {
        await service.addFooterBadge(badgeForm);
        showToast("Trust badge created successfully!", "success");
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to save trust badge", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trust badge?")) return;
    try {
      await service.deleteFooterBadge(id);
      showToast("Trust badge deleted", "success");
      loadData();
    } catch (err: any) {
      showToast("Failed to delete badge", "error");
    }
  };

  const toggleActive = async (badge: any) => {
    try {
      await service.updateFooterBadge(badge._id, { isActive: !badge.isActive });
      showToast(`Badge ${!badge.isActive ? "activated" : "deactivated"}`, "info");
      loadData();
    } catch (err: any) {
      showToast("Failed to toggle status", "error");
    }
  };

  const renderIcon = (name: string, color: string) => {
    const item = ICON_OPTIONS.find((i) => i.value === (name || "").toLowerCase()) || ICON_OPTIONS[0];
    const IconComp = item.icon;
    return <IconComp size={18} style={{ color: color || "#ffd166" }} />;
  };

  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
          <FooterNavTabs onRefresh={loadData} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-theme pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
                <ShieldCheck className="text-amber-500" size={24} /> Trust Badges &amp; Features Strip
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage the highlighted service guarantees displayed at the top of the storefront footer (e.g. 100% Fresh Bakes, Express Midnight).
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2 rounded-xl transition shadow-md shadow-pink-500/20"
            >
              <Plus size={16} />
              <span>Add Trust Badge</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <RefreshCw className="animate-spin text-pink-500" size={28} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Badges List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badges.map((b: any, index: number) => (
                  <div
                    key={b._id || index}
                    className={`p-4 rounded-2xl border transition-all ${
                      b.isActive !== false
                        ? "bg-card-theme border-border-theme shadow-sm"
                        : "bg-muted/20 border-border-theme opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl bg-black/10 dark:bg-white/5 flex items-center justify-center shrink-0 border border-border-theme"
                          style={{ borderColor: `${b.color}40` }}
                        >
                          {renderIcon(b.icon, b.color)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-foreground text-sm">{b.title}</h4>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                b.isActive !== false
                                  ? "bg-emerald-500/15 text-emerald-500"
                                  : "bg-gray-500/15 text-gray-400"
                              }`}
                            >
                              {b.isActive !== false ? "Active" : "Hidden"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{b.subtitle || "No subtitle"}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                            <span>Icon: <b>{b.icon || "award"}</b></span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              Color: <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: b.color || "#ffd166" }} />
                              <b>{b.color}</b>
                            </span>
                            <span>•</span>
                            <span>Order: <b>{b.sortOrder || index + 1}</b></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleActive(b)}
                          className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
                          title={b.isActive !== false ? "Hide on storefront" : "Show on storefront"}
                        >
                          <CheckCircle size={15} className={b.isActive !== false ? "text-emerald-500" : "text-gray-400"} />
                        </button>
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 text-xs text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                          title="Edit badge"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="p-1.5 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete badge"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {badges.length === 0 && (
                <div className="text-center py-12 border border-dashed border-border-theme rounded-2xl bg-muted/10">
                  <ShieldCheck size={36} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-bold text-foreground">No trust badges configured</p>
                  <p className="text-xs text-muted-foreground mt-1">Click &quot;Add Trust Badge&quot; or reset to defaults</p>
                </div>
              )}
            </div>
          )}

          {/* Add / Edit Badge Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-card-theme border border-border-theme rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border-theme pb-3">
                  <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
                    <ShieldCheck className="text-amber-500" size={18} />
                    {editingBadge ? "Edit Trust Badge" : "Create Trust Badge"}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveBadge} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Badge Title</label>
                    <input
                      type="text"
                      required
                      value={badgeForm.title}
                      onChange={(e) => setBadgeForm({ ...badgeForm, title: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                      placeholder="e.g. 100% Fresh Bakes"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={badgeForm.subtitle}
                      onChange={(e) => setBadgeForm({ ...badgeForm, subtitle: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                      placeholder="e.g. Crafted upon order"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Icon</label>
                      <select
                        value={badgeForm.icon}
                        onChange={(e) => setBadgeForm({ ...badgeForm, icon: e.target.value })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Sort Order</label>
                      <input
                        type="number"
                        value={badgeForm.sortOrder}
                        onChange={(e) => setBadgeForm({ ...badgeForm, sortOrder: parseInt(e.target.value) || 0 })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Icon Color (Hex)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={badgeForm.color}
                        onChange={(e) => setBadgeForm({ ...badgeForm, color: e.target.value })}
                        className="w-9 h-9 rounded-xl border border-border-theme cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={badgeForm.color}
                        onChange={(e) => setBadgeForm({ ...badgeForm, color: e.target.value })}
                        className="flex-1 bg-muted/40 border border-border-theme rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      {PRESET_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setBadgeForm({ ...badgeForm, color: col })}
                          className="w-5 h-5 rounded-full border border-black/20 transition hover:scale-110"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={badgeForm.isActive}
                      onChange={(e) => setBadgeForm({ ...badgeForm, isActive: e.target.checked })}
                      className="rounded accent-pink-500 w-4 h-4"
                    />
                    <span>Active and visible on website footer</span>
                  </label>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-theme">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white transition shadow-md shadow-pink-500/20 disabled:opacity-50"
                    >
                      {modalLoading ? <RefreshCw className="animate-spin" size={14} /> : null}
                      <span>{editingBadge ? "Update Badge" : "Create Badge"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AdminMain>
    </ProtectedRoute>
  );
}
