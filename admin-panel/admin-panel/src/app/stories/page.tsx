"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Sparkles,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Edit3,
  Save,
  Image as ImageIcon,
  ExternalLink,
  Upload,
} from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";
import MediaModal from "../components/ui/MediaModal";
import {
  getAdminStories,
  createStory,
  updateStory,
  deleteStory,
  StoryItem,
} from "../services/giftingService";

const PRESET_STORIES = [
  {
    title: "Midnight Cake Celebrations",
    subtitle: "Real happiness delivered right at 12:00 AM",
    mediaUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80",
    tag: "Trending 🔥",
    ctaText: "Order Midnight Cake",
    ctaLink: "/products?category=cake",
  },
  {
    title: "Handcrafted Luxury Bouquets",
    subtitle: "Fresh Dutch roses picked this morning",
    mediaUrl: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&auto=format&fit=crop&q=80",
    tag: "Fresh 🌸",
    ctaText: "Explore Flowers",
    ctaLink: "/products?category=flowers",
  },
  {
    title: "Ferrero Rocher & Chocolate Hampers",
    subtitle: "Sweet indulgence gift bundles",
    mediaUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80",
    tag: "Best Value 🍫",
    ctaText: "Shop Hampers",
    ctaLink: "/products?category=hampers",
  },
];

export default function StoriesPage() {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Media Modal state
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Form state
  const [form, setForm] = useState<Partial<StoryItem>>({
    title: "",
    subtitle: "",
    thumbnail: "",
    mediaUrl: "",
    mediaType: "image",
    duration: 5,
    tag: "Trending",
    ctaText: "Order Now",
    ctaLink: "/products",
    sortOrder: 1,
    isActive: true,
  });

  const loadStories = async () => {
    try {
      setLoading(true);
      const data = await getAdminStories();
      setStories(data);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load stories from server" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const openCreateForm = () => {
    setEditingStory(null);
    setForm({
      title: "",
      subtitle: "",
      thumbnail: "",
      mediaUrl: "",
      mediaType: "image",
      duration: 5,
      tag: "Trending",
      ctaText: "Order Now",
      ctaLink: "/products",
      sortOrder: stories.length + 1,
      isActive: true,
    });
    setShowForm(true);
  };

  const openEditForm = (story: StoryItem) => {
    setEditingStory(story);
    setForm({
      title: story.title,
      subtitle: story.subtitle || "",
      thumbnail: story.thumbnail || story.mediaUrl || "",
      mediaUrl: story.mediaUrl,
      mediaType: story.mediaType || "image",
      duration: story.duration || 5,
      tag: story.tag || "",
      ctaText: story.ctaText || "Order Now",
      ctaLink: story.ctaLink || "/products",
      sortOrder: story.sortOrder || 1,
      isActive: story.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      setMessage({ type: "error", text: "Please enter a story title." });
      return;
    }
    if (!form.mediaUrl?.trim()) {
      setMessage({ type: "error", text: "Please provide a media URL." });
      return;
    }

    try {
      setSaving(true);
      if (editingStory?._id) {
        await updateStory(editingStory._id, form);
        setMessage({ type: "success", text: `Story "${form.title}" updated successfully!` });
      } else {
        await createStory(form);
        setMessage({ type: "success", text: `Story "${form.title}" published!` });
      }
      setShowForm(false);
      setEditingStory(null);
      await loadStories();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Failed to save story highlight",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStory(id);
      setStories((prev) => prev.filter((s) => s._id !== id));
      setDeleteConfirmId(null);
      setMessage({ type: "success", text: "Story removed successfully." });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to delete story highlight" });
    }
  };

  return (
    <ProtectedRoute>
      <AdminMain>
        {/* Global Toast Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200"
              }`}
          >
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span className="text-sm font-semibold">{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MODE A: FULL-PAGE CREATE / EDIT FORM VIEW (NO MODAL!)
        ═══════════════════════════════════════════════════════════════════ */}
        {showForm ? (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-theme">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex items-center justify-center h-11 w-11 rounded-2xl border border-border-theme bg-card hover:bg-hover-theme transition-all shadow-xs cursor-pointer group"
                  title="Back to Stories"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-foreground transition-transform group-hover:-translate-x-0.5" />
                </button>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-500 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
                      {editingStory ? "Edit Story" : "New Reel Highlight"}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                    {editingStory ? `Edit: ${editingStory.title}` : "Create Story Highlight"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-border-theme text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:opacity-95 transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingStory ? "Update Story" : "Publish Story"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2-Column Responsive Layout */}
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Details (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-card border border-border-theme rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border-theme">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                    <h2 className="text-base font-bold text-foreground">Story Information & Links</h2>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Story Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Midnight Birthday Surprises"
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-sm font-medium text-foreground transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Subtitle / Caption
                    </label>
                    <input
                      type="text"
                      value={form.subtitle}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      placeholder="e.g. Fresh Dutch roses & artisan chocolate truffle cake"
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-sm font-medium text-foreground transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Call-to-Action Text
                      </label>
                      <input
                        type="text"
                        value={form.ctaText}
                        onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                        placeholder="e.g. Order Midnight Cake"
                        className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-sm font-medium text-foreground transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Target URL Link
                      </label>
                      <input
                        type="text"
                        value={form.ctaLink}
                        onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                        placeholder="e.g. /products?category=cake"
                        className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-sm font-mono text-foreground transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Tag Badge
                      </label>
                      <input
                        type="text"
                        value={form.tag}
                        onChange={(e) => setForm({ ...form, tag: e.target.value })}
                        placeholder="e.g. Trending 🔥"
                        className="w-full px-3 py-2.5 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-xs font-medium text-foreground transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Duration (Sec)
                      </label>
                      <input
                        type="number"
                        min={3}
                        max={30}
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-xs font-medium text-foreground transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={form.sortOrder}
                        onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-xs font-medium text-foreground transition"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border-theme">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border-theme">
                      <div>
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Live on Storefront & App
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Visible in top highlights carousel
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Media Studio & Interactive Reel Simulation (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-card border border-border-theme rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-border-theme">
                    <div className="flex items-center gap-2.5">
                      <ImageIcon className="w-5 h-5 text-pink-500" />
                      <h2 className="text-base font-bold text-foreground">Story Media Asset</h2>
                    </div>
                    {form.mediaUrl && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Media Selected
                      </span>
                    )}
                  </div>

                  {/* Standard Category / Product Media Picker Box */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Story Media (Image or Video) <span className="text-pink-500">*</span>
                    </label>
                    <div className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-border-theme bg-background flex flex-col items-center justify-center overflow-hidden group">
                      {form.mediaUrl ? (
                        <>
                          {form.mediaType === "video" ? (
                            <video src={form.mediaUrl} className="h-full w-full object-contain p-2" autoPlay muted loop />
                          ) : (
                            <img src={form.mediaUrl} alt="Story preview" className="h-full w-full object-contain p-2" />
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowMediaModal(true)}
                              className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 transition flex items-center gap-1.5"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-pink-600" />
                              Change Media
                            </button>
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, mediaUrl: "" })}
                              className="cursor-pointer bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 transition"
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowMediaModal(true)}
                          className="cursor-pointer flex flex-col items-center gap-2 p-8 w-full h-full justify-center hover:bg-hover-theme/50 transition"
                        >
                          <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl">
                            <Upload size={24} />
                          </div>
                          <span className="text-xs font-bold text-pink-600 dark:text-pink-400">Select Media from Library</span>
                          <span className="text-[11px] text-slate-400">Browse library or upload new via Media Modal</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Live Phone Reel Simulation */}
                  {form.mediaUrl && (
                    <div className="pt-4 border-t border-border-theme flex flex-col items-center justify-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Phone Reel Preview (9:16)</p>
                      <div className="relative w-full aspect-[9/16] max-w-[200px] rounded-[2rem] overflow-hidden shadow-xl border-4 border-slate-900 bg-slate-950 flex flex-col justify-between p-3 select-none group">
                        {form.mediaType === "video" ? (
                          <video src={form.mediaUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop />
                        ) : (
                          <img src={form.mediaUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />

                        <div className="relative z-10 space-y-1.5">
                          <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden">
                            <div className="bg-white h-full w-3/4 rounded-full animate-pulse" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-amber-500 border border-white/80 flex items-center justify-center text-[9px] text-white font-black">
                              GF
                            </div>
                            <span className="text-white text-[10px] font-bold drop-shadow">GiftCart</span>
                            {form.tag && (
                              <span className="ml-auto text-[8px] font-black px-1.5 py-0.2 rounded-full bg-pink-600 text-white shadow-xs truncate max-w-[70px]">
                                {form.tag}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="relative z-10 space-y-1.5">
                          <div>
                            <p className="text-white font-black text-xs drop-shadow leading-tight line-clamp-1">
                              {form.title || "Story Title"}
                            </p>
                            {form.subtitle && (
                              <p className="text-white/80 text-[9px] mt-0.5 drop-shadow line-clamp-2 leading-tight">
                                {form.subtitle}
                              </p>
                            )}
                          </div>

                          <div className="w-full py-1.5 px-2 rounded-xl bg-white text-slate-900 font-black text-[10px] text-center shadow-lg flex items-center justify-center gap-1">
                            <span className="truncate">{form.ctaText || "Order Now"}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
              MODE B: MAIN LIST VIEW
          ═══════════════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-theme">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] font-bold text-pink-500">
                  Visual Mobile Engagement
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                  Story Highlights Manager
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Manage Instagram-style reel cards and celebratory stories showcased at the top of the mobile app and website
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadStories}
                  className="p-2.5 rounded-xl border border-border-theme hover:bg-hover-theme text-slate-500 hover:text-foreground transition cursor-pointer"
                  title="Refresh Stories"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={openCreateForm}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:opacity-95 transition cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  Create Story Highlight
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-pink-500 mb-3" />
                <p className="text-sm font-semibold">Loading story highlights...</p>
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border-theme rounded-3xl p-8">
                <div className="w-16 h-16 rounded-3xl bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No Story Highlights Created</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                  Add engaging Instagram-style stories with direct CTA links to your best-selling cakes.
                </p>
                <button
                  onClick={openCreateForm}
                  className="px-5 py-2.5 rounded-xl bg-pink-600 text-white text-xs font-bold shadow-md hover:opacity-95 cursor-pointer"
                >
                  Create First Story
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {stories.map((story) => (
                  <div
                    key={story._id}
                    className={`bg-card border rounded-3xl overflow-hidden transition-all duration-200 group flex flex-col justify-between hover:shadow-lg hover:border-pink-500/40 ${story.isActive ? "border-border-theme" : "border-border-theme/40 opacity-60"
                      }`}
                  >
                    <div>
                      {/* Vertical 9:16 frame */}
                      <div className="relative aspect-[9/14] overflow-hidden bg-slate-900">
                        <img
                          src={story.mediaUrl}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />

                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          {story.tag ? (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-600 text-white shadow-sm">
                              {story.tag}
                            </span>
                          ) : (
                            <span />
                          )}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={async () => {
                                if (!story._id) return;
                                try {
                                  await updateStory(story._id, { isActive: !story.isActive });
                                  setStories((prev) => prev.map((s) => (s._id === story._id ? { ...s, isActive: !s.isActive } : s)));
                                  setMessage({ type: "success", text: `"${story.title}" set to ${!story.isActive ? "Active" : "Disabled"}` });
                                  setTimeout(() => setMessage(null), 2500);
                                } catch (e) {
                                  setMessage({ type: "error", text: "Failed to update story status" });
                                }
                              }}
                              className={`text-[9px] font-black px-2 py-0.5 rounded-full border cursor-pointer backdrop-blur-md transition ${
                                story.isActive
                                  ? "bg-emerald-500/80 text-white border-emerald-400 hover:bg-emerald-600"
                                  : "bg-slate-800/80 text-slate-300 border-slate-600 hover:bg-slate-700"
                              }`}
                              title="Click to toggle story active status"
                            >
                              {story.isActive ? "Active" : "Disabled"}
                            </button>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                              {story.duration || 5}s
                            </span>
                          </div>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-bold text-sm leading-tight drop-shadow">{story.title}</h3>
                          {story.subtitle && (
                            <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5 drop-shadow">
                              {story.subtitle}
                            </p>
                          )}
                          {story.ctaText && (
                            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-[10px] font-bold border border-white/30">
                              <span>{story.ctaText}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-3 border-t border-border-theme bg-background/50 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openEditForm(story)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-theme hover:bg-hover-theme text-xs font-bold text-foreground transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                        Edit Reel
                      </button>

                      {deleteConfirmId === story._id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => story._id && handleDelete(story._id)}
                            className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-2 text-xs font-bold text-slate-400 hover:text-foreground cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(story._id || null)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Delete Story"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Media Library / Upload Modal */}
        {showMediaModal && (
          <MediaModal
            onClose={() => setShowMediaModal(false)}
            onSelect={(urls) => {
              const selectedUrl = Array.isArray(urls) ? urls[0] : urls;
              if (selectedUrl) {
                setForm((prev) => ({ ...prev, mediaUrl: selectedUrl, thumbnail: selectedUrl }));
              }
              setShowMediaModal(false);
            }}
            multiple={false}
          />
        )}
      </AdminMain>
    </ProtectedRoute>
  );
}
