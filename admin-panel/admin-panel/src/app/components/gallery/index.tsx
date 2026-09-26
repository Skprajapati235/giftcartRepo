"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  Plus,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  CheckCircle2,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Layers,
  Film,
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import DeleteModal from "../ui/DeleteModal";
import AddEditGallery from "./addEditGallery";
import GalleryList from "./galleryList";
import GallerySettingsStudio from "./gallerySettingsStudio";
import {
  getGalleryItems,
  getGalleryCategories,
  deleteGalleryItem,
  bulkDeleteGalleryItems,
  updateGalleryStatus,
  GalleryItem,
  GalleryStats,
} from "../../services/galleryService";

export default function GalleryView() {
  const { showToast } = useToast();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<GalleryStats>({
    total: 0,
    active: 0,
    featured: 0,
    categoriesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [mediaType, setMediaType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Tab mode: media list vs UI layout studio
  const [activeTab, setActiveTab] = useState<"media" | "studio">("media");

  // Selection & Form View State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load distinct categories
  const loadCategories = useCallback(async () => {
    try {
      const res = await getGalleryCategories();
      if (res?.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.warn("Failed to load categories:", err);
    }
  }, []);

  // Fetch Gallery Items
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        search: debouncedSearch,
        category: category !== "all" ? category : undefined,
        mediaType: mediaType !== "all" ? mediaType : undefined,
      };

      if (statusFilter === "active") params.isActive = true;
      if (statusFilter === "hidden") params.isActive = false;
      if (statusFilter === "featured") params.isFeatured = true;

      const res = await getGalleryItems(params);
      if (res.success) {
        setItems(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
        if (res.stats) setStats(res.stats);
        if (res.categories && res.categories.length > 0) setCategories(res.categories);
      }
    } catch (error: any) {
      console.error("Failed to load gallery:", error);
      showToast(error?.response?.data?.message || "Failed to load gallery", "error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, category, mediaType, statusFilter, showToast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page on filter changes
  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setPage(1);
    setSelectedIds([]);
  };

  // Status toggle handler
  const handleToggleStatus = async (
    item: GalleryItem,
    updates: { isActive?: boolean; isFeatured?: boolean }
  ) => {
    try {
      await updateGalleryStatus(item._id, updates);
      showToast(
        updates.isActive !== undefined
          ? `Media is now ${updates.isActive ? "Live" : "Draft"}`
          : "Featured status updated!",
        "success"
      );
      loadData();
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  // Single delete
  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteGalleryItem(deleteId);
      showToast("Media item deleted successfully", "success");
      setDeleteId(null);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteId));
      loadData();
      loadCategories();
    } catch {
      showToast("Failed to delete item", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete
  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await bulkDeleteGalleryItems(selectedIds);
      showToast(`${selectedIds.length} media items deleted successfully`, "success");
      setSelectedIds([]);
      setIsBulkDeleting(false);
      loadData();
      loadCategories();
    } catch {
      showToast("Failed to delete media items", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // If adding or editing, render dedicated full-page form
  if (showForm) {
    return (
      <AddEditGallery
        item={editingItem}
        onClose={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
        onSuccess={() => {
          setShowForm(false);
          setEditingItem(null);
          loadData();
          loadCategories();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Primary Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
            <ImageIcon size={14} />
            Moments & Visual Showcase
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Celebration Gallery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Curate customer celebration stories, bouquet setups, event decoration reels, and link items for direct purchase.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              loadData();
              loadCategories();
            }}
            title="Refresh Data"
            className="p-2.5 rounded-2xl border border-border-theme bg-card hover:bg-hover-theme text-slate-600 dark:text-slate-300 transition"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-primary" : ""} />
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:opacity-90 text-white font-bold text-sm shadow-xl shadow-primary/25 transition active:scale-95"
          >
            <Plus size={18} />
            <span>Add Media</span>
          </button>
        </div>
      </div>

      {/* 2. Platform Mode Tabs: Media Items vs Multi-Platform Layout Studio */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-theme pb-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border-theme shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "media"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ImageIcon size={15} />
            <span>Gallery Media ({total})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "studio"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <SlidersHorizontal size={15} />
            <span>UI Design Studio (Mobile & Web)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold animate-pulse">
              LIVE
            </span>
          </button>
        </div>

        {activeTab === "media" ? (
          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition"
          >
            <SlidersHorizontal size={14} />
            <span>Change Mobile / Website UI Design</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-theme bg-card hover:bg-hover-theme text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            <ImageIcon size={14} />
            <span>Back to Media Items</span>
          </button>
        )}
      </div>

      {activeTab === "studio" ? (
        <GallerySettingsStudio
          onClose={() => setActiveTab("media")}
          onSaved={() => {
            loadData();
          }}
        />
      ) : (
        <>
          {/* 3. KPI Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Media */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border-theme flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <ImageIcon size={24} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Media
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </div>
          </div>
        </div>

        {/* Live on App & Web */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border-theme flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 relative">
            <CheckCircle2 size={24} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Live on App
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.active}
            </div>
          </div>
        </div>

        {/* Featured Highlights */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border-theme flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Home Showcase
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-500">
              {stats.featured}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border-theme flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <Layers size={24} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Categories
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.categoriesCount}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Toolbar: Search, Filters & View Switcher */}
      <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border-theme space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, story, tags or category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border-theme bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/25 transition"
            />
          </div>

          {/* Media Type & Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <select
              value={mediaType}
              onChange={(e) => handleFilterChange(setMediaType, e.target.value)}
              className="px-3 py-2 rounded-xl border border-border-theme bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/25 shrink-0"
            >
              <option value="all">All Formats</option>
              <option value="image">Photos Only 📸</option>
              <option value="video">Videos Only 🎬</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              className="px-3 py-2 rounded-xl border border-border-theme bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/25 shrink-0"
            >
              <option value="all">All Status</option>
              <option value="active">Live on App/Web</option>
              <option value="hidden">Hidden / Draft</option>
              <option value="featured">Featured on Home</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-border-theme p-1 bg-slate-50 dark:bg-slate-900 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid Cards View"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-card text-primary shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Dense Table View"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "table"
                    ? "bg-card text-primary shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-border-theme pt-3 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 flex items-center gap-1 shrink-0">
            <SlidersHorizontal size={12} />
            Category:
          </span>
          <button
            onClick={() => handleFilterChange(setCategory, "all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              category === "all"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 dark:text-slate-300 hover:bg-hover-theme"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleFilterChange(setCategory, cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-hover-theme"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Media Items Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:underline px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={() => setIsBulkDeleting(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-md shadow-red-500/20 transition"
            >
              <Trash2 size={13} />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Gallery List */}
      <GalleryList
        items={items}
        loading={loading}
        viewMode={viewMode}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={(item) => {
          setEditingItem(item);
          setShowForm(true);
        }}
        onDelete={(id) => setDeleteId(id)}
        onToggleStatus={handleToggleStatus}
        onOpenAdd={() => {
          setEditingItem(null);
          setShowForm(true);
        }}
      />

      {/* 6. Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border-theme">
          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-800 dark:text-slate-200">{items.length}</strong> of{" "}
            <strong className="text-slate-800 dark:text-slate-200">{total}</strong> media items
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-border-theme bg-card hover:bg-hover-theme disabled:opacity-40 text-slate-600 dark:text-slate-300 transition"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-3">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-border-theme bg-card hover:bg-hover-theme disabled:opacity-40 text-slate-600 dark:text-slate-300 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
        </>
      )}

      {/* 7. Delete Single Confirmation */}
      <DeleteModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Media Item"
        description="Are you sure you want to delete this celebration moment? It will immediately stop appearing on the mobile app and website."
        isLoading={isDeleting}
      />

      {/* 8. Bulk Delete Confirmation */}
      <DeleteModal
        isOpen={isBulkDeleting}
        onClose={() => setIsBulkDeleting(false)}
        onConfirm={confirmBulkDelete}
        title="Bulk Delete Media Items"
        description={`Are you sure you want to permanently delete all ${selectedIds.length} selected items?`}
        isLoading={isDeleting}
      />
    </div>
  );
}
