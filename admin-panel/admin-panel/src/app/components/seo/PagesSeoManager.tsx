"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  ExternalLink,
  X,
  Upload,
} from "lucide-react";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";
import MediaModal from "../ui/MediaModal";
import SerpPreview from "./SerpPreview";
import SocialCardPreview from "./SocialCardPreview";

export default function PagesSeoManager() {
  const { showToast } = useToast();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState<any>({
    path: "",
    pageName: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywordsInput: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    noIndex: false,
    noFollow: false,
    structuredData: "",
    sitemapPriority: 0.8,
    changeFrequency: "weekly",
    includeInSitemap: true,
  });

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await service.getSeoPages({ page, limit: 15, search });
      if (res && res.data) {
        setPages(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err: any) {
      showToast("Failed to fetch SEO pages", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [page, search]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      path: "",
      pageName: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywordsInput: "",
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      noIndex: false,
      noFollow: false,
      structuredData: "",
      sitemapPriority: 0.8,
      changeFrequency: "weekly",
      includeInSitemap: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      path: item.path,
      pageName: item.pageName,
      metaTitle: item.metaTitle,
      metaDescription: item.metaDescription,
      metaKeywordsInput: Array.isArray(item.metaKeywords) ? item.metaKeywords.join(", ") : "",
      canonicalUrl: item.canonicalUrl || "",
      ogTitle: item.ogTitle || "",
      ogDescription: item.ogDescription || "",
      ogImage: item.ogImage || "",
      noIndex: !!item.noIndex,
      noFollow: !!item.noFollow,
      structuredData: item.structuredData || "",
      sitemapPriority: item.sitemapPriority || 0.8,
      changeFrequency: item.changeFrequency || "weekly",
      includeInSitemap: item.includeInSitemap !== false,
    });
    setModalOpen(true);
  };

  const handleSeed = async () => {
    try {
      const res = await service.seedSeoPages();
      showToast(`Seeding complete: ${res.addedCount} default pages added!`, "success");
      fetchPages();
    } catch (err: any) {
      showToast("Failed to seed default pages", "error");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.path.trim() || !form.pageName.trim() || !form.metaTitle.trim()) {
      showToast("Path, Page Name, and Meta Title are required", "error");
      return;
    }
    setSaving(true);
    try {
      const keywords = (form.metaKeywordsInput || "")
        .split(",")
        .map((k: string) => k.trim())
        .filter(Boolean);

      const payload = {
        ...form,
        metaKeywords: keywords,
      };

      if (editingItem?._id) {
        await service.updateSeoPage(editingItem._id, payload);
        showToast("Page SEO updated successfully!", "success");
      } else {
        await service.createSeoPage(payload);
        showToast("Page SEO rule created successfully!", "success");
      }
      setModalOpen(false);
      fetchPages();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to save page SEO", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await service.deleteSeoPage(id);
      showToast("Page SEO rule deleted", "success");
      setDeleteConfirmId(null);
      fetchPages();
    } catch (err: any) {
      showToast("Failed to delete page SEO rule", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-theme pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FileText className="text-primary" size={28} /> Page-by-Page SEO Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize meta titles, search descriptions, canonical URLs, and indexation directives for specific routes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            className="flex items-center gap-2 bg-card border border-border-theme hover:bg-hover-theme text-foreground px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm"
          >
            <Sparkles size={16} className="text-amber-500" />
            Seed Default Pages
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:opacity-90 transition shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            Add Page SEO
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by path, name, or title..."
            className="w-full bg-card border border-border-theme rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          Total Pages: <span className="font-bold text-foreground">{totalCount}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border-theme rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/80 border-b border-border-theme text-xs font-bold uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Page / Path</th>
                <th className="px-6 py-4">Meta Title</th>
                <th className="px-6 py-4">Status & Index</th>
                <th className="px-6 py-4">Sitemap</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <RefreshCw className="animate-spin mx-auto text-primary" size={24} />
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    No SEO pages configured yet. Click "Seed Default Pages" to populate default routes automatically!
                  </td>
                </tr>
              ) : (
                pages.map((item) => (
                  <tr key={item._id} className="hover:bg-hover-theme/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{item.pageName}</div>
                      <div className="text-xs font-mono text-primary flex items-center gap-1 mt-0.5">
                        {item.path}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-medium text-foreground truncate">{item.metaTitle}</div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {item.metaDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.noIndex ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">
                          <XCircle size={13} /> NoIndex
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <CheckCircle2 size={13} /> Indexable
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      <div>Priority: <span className="font-bold text-foreground">{item.sitemapPriority ?? 0.8}</span></div>
                      <div>Freq: <span className="capitalize">{item.changeFrequency || "weekly"}</span></div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-background rounded-lg transition"
                          title="Edit SEO"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item._id)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-background rounded-lg transition"
                          title="Delete Rule"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border-theme rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-theme bg-background/50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="text-primary" size={22} />
                {editingItem ? `Edit SEO: ${editingItem.pageName}` : "Add New Page SEO Rule"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form fields */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                        Route Path <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.path}
                        onChange={(e) => setForm({ ...form, path: e.target.value })}
                        placeholder="e.g. /about, /offers, /"
                        className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                        Page Label / Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.pageName}
                        onChange={(e) => setForm({ ...form, pageName: e.target.value })}
                        placeholder="e.g. About Us, Offers"
                        className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Meta Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.metaTitle}
                      onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                      placeholder="Title tag displayed in Google results..."
                      className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Meta Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={form.metaDescription}
                      onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                      placeholder="Compelling 140-160 character description..."
                      className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Focus Keywords (comma-separated)
                    </label>
                    <input
                      value={form.metaKeywordsInput}
                      onChange={(e) => setForm({ ...form, metaKeywordsInput: e.target.value })}
                      placeholder="e.g. cake delivery faridabad, best gifts"
                      className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Canonical URL Override (Optional)
                    </label>
                    <input
                      value={form.canonicalUrl}
                      onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                      placeholder="Leave blank to use default canonical URL"
                      className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Social Share Image (OG Image)
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={form.ogImage}
                        onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                        placeholder="https://giftfestive.com/images/share.jpg"
                        className="flex-1 bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMediaModal(true)}
                        className="bg-card border border-border-theme px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-hover-theme flex items-center gap-1.5"
                      >
                        <Upload size={14} /> Select
                      </button>
                    </div>
                  </div>

                  {/* Indexing & Sitemap settings */}
                  <div className="p-4 bg-background/60 rounded-2xl border border-border-theme space-y-4">
                    <span className="text-xs font-bold uppercase text-muted-foreground block">
                      Robots & Sitemap Directives
                    </span>
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.noIndex}
                          onChange={(e) => setForm({ ...form, noIndex: e.target.checked })}
                          className="rounded text-primary focus:ring-primary"
                        />
                        NoIndex (Hide from Google)
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.noFollow}
                          onChange={(e) => setForm({ ...form, noFollow: e.target.checked })}
                          className="rounded text-primary focus:ring-primary"
                        />
                        NoFollow (Do not follow links)
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.includeInSitemap}
                          onChange={(e) => setForm({ ...form, includeInSitemap: e.target.checked })}
                          className="rounded text-primary focus:ring-primary"
                        />
                        Include in Sitemap.xml
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                          Sitemap Priority (0.1 - 1.0)
                        </label>
                        <select
                          value={form.sitemapPriority}
                          onChange={(e) => setForm({ ...form, sitemapPriority: parseFloat(e.target.value) })}
                          className="w-full bg-background border border-border-theme rounded-xl px-3 py-2 text-xs"
                        >
                          <option value={1.0}>1.0 (Critical / Home)</option>
                          <option value={0.9}>0.9 (High / Categories)</option>
                          <option value={0.8}>0.8 (Standard / Products)</option>
                          <option value={0.7}>0.7 (Support Pages)</option>
                          <option value={0.5}>0.5 (Policies / Terms)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                          Change Frequency
                        </label>
                        <select
                          value={form.changeFrequency}
                          onChange={(e) => setForm({ ...form, changeFrequency: e.target.value })}
                          className="w-full bg-background border border-border-theme rounded-xl px-3 py-2 text-xs capitalize"
                        >
                          <option value="always">Always</option>
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Custom Schema JSON-LD (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={form.structuredData}
                      onChange={(e) => setForm({ ...form, structuredData: e.target.value })}
                      placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  ...\n}`}
                      className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <div className="lg:col-span-5 space-y-6">
                  <SerpPreview
                    title={form.metaTitle}
                    description={form.metaDescription}
                    url={`https://giftfestive.com${form.path.startsWith("/") ? form.path : `/${form.path}`}`}
                  />
                  <SocialCardPreview
                    title={form.ogTitle || form.metaTitle}
                    description={form.ogDescription || form.metaDescription}
                    image={form.ogImage}
                    url={`https://giftfestive.com${form.path.startsWith("/") ? form.path : `/${form.path}`}`}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border-theme bg-background/50">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 text-xs font-bold rounded-xl border border-border-theme hover:bg-hover-theme transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-primary text-white hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {saving ? "Saving..." : editingItem ? "Update Page SEO" : "Create Page SEO"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border-theme rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Delete Page SEO Rule?</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete this custom SEO rule? Search engines will fall back to global site defaults.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-border-theme hover:bg-hover-theme"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {showMediaModal && (
        <MediaModal
          onClose={() => setShowMediaModal(false)}
          onSelect={(url) => {
            setForm({ ...form, ogImage: url as string });
            setShowMediaModal(false);
          }}
          multiple={false}
        />
      )}
    </div>
  );
}
