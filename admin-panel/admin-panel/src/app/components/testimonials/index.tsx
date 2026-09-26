"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Quote,
  Plus,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  Star,
  CheckCircle2,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Globe,
  CheckCircle,
} from "lucide-react";

const InstagramIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import { useToast } from "../../../context/ToastContext";
import DeleteModal from "../ui/DeleteModal";
import AddEditTestimonial from "./addEditTestimonial";
import TestimonialList from "./testimonialList";
import {
  getTestimonials,
  deleteTestimonial,
  bulkDeleteTestimonials,
  updateTestimonialStatus,
  Testimonial,
  TestimonialStats,
} from "../../services/testimonialService";

const PLATFORM_FILTERS = [
  { value: "all", label: "All Sources" },
  { value: "website", label: "Website", icon: Globe },
  { value: "google", label: "Google", icon: Sparkles },
  { value: "instagram", label: "Instagram", icon: InstagramIcon },
  { value: "trustpilot", label: "Trustpilot", icon: CheckCircle },
];

export default function TestimonialsView() {
  const { showToast } = useToast();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<TestimonialStats>({
    total: 0,
    active: 0,
    featured: 0,
    avgRating: 5.0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'hidden' | 'featured'
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Selection & Form View State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

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

  // Fetch Testimonials
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        search: debouncedSearch,
        platform: platform !== "all" ? platform : undefined,
      };

      if (statusFilter === "active") params.isActive = true;
      if (statusFilter === "hidden") params.isActive = false;
      if (statusFilter === "featured") params.isFeatured = true;

      if (ratingFilter !== "all") params.rating = ratingFilter;

      const res = await getTestimonials(params);
      if (res.success) {
        setTestimonials(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (error: any) {
      console.error("Failed to load testimonials:", error);
      showToast(error?.response?.data?.message || "Failed to load testimonials", "error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, platform, statusFilter, ratingFilter, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when filters change
  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setPage(1);
    setSelectedIds([]);
  };

  // Status toggle handler
  const handleToggleStatus = async (
    item: Testimonial,
    updates: { isActive?: boolean; isFeatured?: boolean }
  ) => {
    try {
      await updateTestimonialStatus(item._id, updates);
      showToast(
        updates.isActive !== undefined
          ? `Testimonial is now ${updates.isActive ? "Live" : "Draft"}`
          : `Featured status updated!`,
        "success"
      );
      loadData();
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  // Delete single
  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteTestimonial(deleteId);
      showToast("Testimonial deleted successfully", "success");
      setDeleteId(null);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteId));
      loadData();
    } catch {
      showToast("Failed to delete testimonial", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete
  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await bulkDeleteTestimonials(selectedIds);
      showToast(`${selectedIds.length} testimonials deleted successfully`, "success");
      setSelectedIds([]);
      setIsBulkDeleting(false);
      loadData();
    } catch {
      showToast("Failed to delete testimonials", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (showForm) {
    return (
      <AddEditTestimonial
        testimonial={editingItem}
        onClose={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
        onSuccess={() => {
          setShowForm(false);
          setEditingItem(null);
          loadData();
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
            <Quote size={14} className="rotate-180" />
            Social Proof & Trust Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Client Testimonials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Curate customer love stories, corporate endorsements, and verified platform reviews to boost buyer confidence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
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
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Testimonials */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border-theme flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Quote size={24} className="rotate-180" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Reviews
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </div>
          </div>
        </div>

        {/* Active on Storefront */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border-theme flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 relative">
            <CheckCircle2 size={24} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Live on Site
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.active}
            </div>
          </div>
        </div>

        {/* Featured Stories */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border-theme flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Featured Highlights
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-500">
              {stats.featured}
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border-theme flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="p-3 rounded-2xl bg-amber-400/15 text-amber-500">
            <Star size={24} className="fill-amber-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Customer Rating
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{stats.avgRating || 5.0}</span>
              <span className="text-xs font-bold text-amber-500">/ 5.0</span>
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
              placeholder="Search by customer name, company, title or feedback..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border-theme bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/25 transition"
            />
          </div>

          {/* Status & Rating Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              className="px-3 py-2 rounded-xl border border-border-theme bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/25 shrink-0"
            >
              <option value="all">All Status</option>
              <option value="active">Live on Site</option>
              <option value="hidden">Hidden / Draft</option>
              <option value="featured">Featured Only</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => handleFilterChange(setRatingFilter, e.target.value)}
              className="px-3 py-2 rounded-xl border border-border-theme bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/25 shrink-0"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars Only 🌟</option>
              <option value="4">4 Stars & Above</option>
              <option value="3">3 Stars & Above</option>
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

        {/* Platform Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-border-theme pt-3 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 flex items-center gap-1 shrink-0">
            <SlidersHorizontal size={12} />
            Source:
          </span>
          {PLATFORM_FILTERS.map((p) => {
            const active = platform === p.value;
            return (
              <button
                key={p.value}
                onClick={() => handleFilterChange(setPlatform, p.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-hover-theme"
                }`}
              >
                {p.icon && <p.icon size={12} />}
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Bulk Actions Bar (Sticky if items selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Testimonials Selected
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

      {/* 5. Main Testimonials List */}
      <TestimonialList
        testimonials={testimonials}
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
        onOpenAddModal={() => {
          setEditingItem(null);
          setShowForm(true);
        }}
      />

      {/* 6. Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border-theme">
          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-800 dark:text-slate-200">{testimonials.length}</strong> of{" "}
            <strong className="text-slate-800 dark:text-slate-200">{total}</strong> testimonials
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

      {/* 7. Single Delete Confirmation */}
      <DeleteModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Testimonial"
        description="Are you sure you want to delete this customer testimonial? This action cannot be undone."
        isLoading={isDeleting}
      />

      {/* 9. Bulk Delete Confirmation */}
      <DeleteModal
        isOpen={isBulkDeleting}
        onClose={() => setIsBulkDeleting(false)}
        onConfirm={confirmBulkDelete}
        title="Bulk Delete Testimonials"
        description={`Are you sure you want to permanently delete all ${selectedIds.length} selected testimonials?`}
        isLoading={isDeleting}
      />
    </div>
  );
}
