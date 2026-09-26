"use client";

import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import * as service from "../../services/adminService";
import { useAdmin } from "../../context/AdminContext";
import { useToast } from "../../../context/ToastContext";
import MediaModal from "../ui/MediaModal";

interface AddEditCategoryProps {
  category: any;
  onClose: () => void;
}

export default function AddEditCategory({ category, onClose }: AddEditCategoryProps) {
  const { createCategory, updateCategory } = useAdmin();
  const { showToast } = useToast();
  const [name, setName] = useState(category?.name || "");
  const [image, setImage] = useState(category?.image || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [seoTitle, setSeoTitle] = useState(category?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(category?.seoDescription || "");
  const [seoKeywords, setSeoKeywords] = useState(
    Array.isArray(category?.seoKeywords) ? category.seoKeywords.join(", ") : category?.seoKeywords || ""
  );
  const [bottomContent, setBottomContent] = useState(category?.bottomContent || "");
  const [showSeo, setShowSeo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Auto-generate slug when name changes if slug is empty
  const handleNameChange = (val: string) => {
    setName(val);
    if (!category?._id && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const parsedKeywords = seoKeywords
        .split(",")
        .map((k: string) => k.trim())
        .filter(Boolean);

      const payload = {
        name,
        image,
        slug: slug.trim().toLowerCase(),
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
        seoKeywords: parsedKeywords,
        bottomContent: bottomContent.trim(),
      };
      if (category?._id) {
        await updateCategory(category._id, payload);
        showToast("Category updated!", "success");
      } else {
        await createCategory(payload);
        showToast("Category created!", "success");
      }
      onClose();
    } catch (err) {
      showToast("Failed to save category", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-card rounded-3xl border border-border-theme p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold">{category?._id ? "Update Category" : "New Category"}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>
      <form className="grid gap-8 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category Name</label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
              placeholder="e.g. Designer Cakes, Flowers..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              URL Slug (e.g. cakes, bouquets)
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none transition"
              placeholder="e.g. designer-cakes"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category Image</label>
          <div className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-border-theme bg-background flex flex-col items-center justify-center overflow-hidden group">
            {image ? (
              <>
                <img src={image} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button type="button" onClick={() => setShowMediaModal(true)} className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold">
                    Change
                  </button>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => setShowMediaModal(true)} className="cursor-pointer flex flex-col items-center gap-2">
                <Upload size={24} className="text-slate-300" />
                <span className="text-xs font-bold text-blue-600">Select Image</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible SEO Section */}
        <div className="md:col-span-2 border border-border-theme rounded-2xl p-5 bg-background/50 space-y-4">
          <div
            onClick={() => setShowSeo(!showSeo)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                🌐 SEO & Google Search Settings
              </span>
              <span className="text-xs text-muted-foreground">
                (Click to {showSeo ? "collapse" : "expand"})
              </span>
            </div>
            <span className="text-xs font-bold text-primary">
              {showSeo ? "Hide ▲" : "Show ▼"}
            </span>
          </div>

          {showSeo && (
            <div className="pt-3 border-t border-border-theme space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                    SEO Meta Title
                  </label>
                  <input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={`e.g. Buy Fresh ${name || "Cakes"} Online in Faridabad`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                    Focus Keywords (comma-separated)
                  </label>
                  <input
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. cakes faridabad, best birthday cakes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                  SEO Meta Description
                </label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Appears in Google search snippets under the category title..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                  Category Bottom Content (Rich SEO Text for Higher Google Ranking)
                </label>
                <textarea
                  rows={3}
                  value={bottomContent}
                  onChange={(e) => setBottomContent(e.target.value)}
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Detailed paragraph explaining your products, delivery options, and reasons to buy in Faridabad. Search engines rank this heavily."
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 md:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-32 border border-border-theme text-slate-700 rounded-xl px-4 py-2 text-sm font-bold hover:bg-hover-theme transition text-center"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="w-full sm:w-32 bg-primary text-white rounded-xl px-4 py-2 text-sm font-bold hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-50 text-center"
          >
            {saving ? "Processing..." : category?._id ? "Update" : "Create"}
          </button>
        </div>
      </form>
      {showMediaModal && (
        <MediaModal
          onClose={() => setShowMediaModal(false)}
          onSelect={(url) => setImage(url as string)}
          multiple={false}
        />
      )}
    </section>
  );
}
