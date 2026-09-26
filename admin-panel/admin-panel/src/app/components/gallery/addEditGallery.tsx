"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Upload,
  Video,
  Image as ImageIcon,
  Sparkles,
  Eye,
  Hash,
  ShoppingBag,
  Tag,
  Check,
  Heart,
  Play,
  Film,
  Save,
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import MediaModal from "../ui/MediaModal";
import {
  createGalleryItem,
  updateGalleryItem,
  GalleryItem,
} from "../../services/galleryService";
import { getProducts } from "../../services/adminService";

interface AddEditGalleryProps {
  item?: GalleryItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const DEFAULT_CATEGORIES = [
  "Flowers",
  "Cakes",
  "Hampers",
  "Weddings",
  "Celebrations",
  "Corporate",
  "Birthdays",
  "Surprises",
];

export default function AddEditGallery({
  item,
  onClose,
  onSuccess,
}: AddEditGalleryProps) {
  const { showToast } = useToast();

  const [title, setTitle] = useState(item?.title || "");
  const [caption, setCaption] = useState(item?.caption || "");
  const [image, setImage] = useState(item?.image || "");
  const [mediaType, setMediaType] = useState<"image" | "video">(item?.mediaType || "image");
  const [videoUrl, setVideoUrl] = useState(item?.videoUrl || "");
  const [category, setCategory] = useState(item?.category || "Celebrations");
  const [customCategory, setCustomCategory] = useState("");
  const [tagsInput, setTagsInput] = useState(item?.tags ? item.tags.join(", ") : "");
  const [likes, setLikes] = useState<number>(item?.likes ?? 0);
  const [order, setOrder] = useState<number>(item?.order ?? 0);
  const [isActive, setIsActive] = useState<boolean>(item?.isActive !== false);
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(item?.isFeatured));
  const [linkedProductId, setLinkedProductId] = useState<string>(
    item?.linkedProduct?._id || ""
  );

  const [products, setProducts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Load available products for linked product selection
  useEffect(() => {
    getProducts({ limit: 100 })
      .then((res) => {
        if (Array.isArray(res)) setProducts(res);
        else if (res?.data) setProducts(res.data);
        else if (res?.products) setProducts(res.products);
      })
      .catch((err) => console.warn("Failed to fetch products for gallery:", err));
  }, []);

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setCaption(item.caption || "");
      setImage(item.image || "");
      setMediaType(item.mediaType || "image");
      setVideoUrl(item.videoUrl || "");
      setCategory(item.category || "Celebrations");
      setTagsInput(item.tags ? item.tags.join(", ") : "");
      setLikes(item.likes ?? 0);
      setOrder(item.order ?? 0);
      setIsActive(item.isActive !== false);
      setIsFeatured(Boolean(item.isFeatured));
      setLinkedProductId(item.linkedProduct?._id || "");
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("Please enter a title for the media item", "error");
      return;
    }
    if (!image.trim()) {
      showToast("Please provide or select a media image/thumbnail", "error");
      return;
    }

    const finalCategory = category === "__custom__" ? customCategory.trim() || "Celebrations" : category;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      const payload: Partial<GalleryItem> = {
        title: title.trim(),
        caption: caption.trim(),
        image: image.trim(),
        mediaType,
        videoUrl: videoUrl.trim(),
        category: finalCategory,
        tags,
        likes: Number(likes) || 0,
        order: Number(order) || 0,
        isActive,
        isFeatured,
        linkedProduct: (linkedProductId as any) || null,
      };

      if (item?._id) {
        await updateGalleryItem(item._id, payload);
        showToast("Gallery item updated successfully! ✨", "success");
      } else {
        await createGalleryItem(payload);
        showToast("Gallery item published successfully! 🎉", "success");
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to save gallery item", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectedProduct = products.find((p) => p._id === linkedProductId);

  return (
    <div className="bg-card rounded-3xl border border-border-theme p-6 sm:p-8 shadow-sm animate-in fade-in duration-200">
      {/* Page Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-border-theme pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl border border-border-theme hover:bg-hover-theme text-slate-600 dark:text-slate-300 transition flex items-center gap-2 font-bold text-xs"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {item?._id ? "Edit Gallery Item" : "Add New Gallery Media"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {item?._id
                ? "Update celebration photo, video reel, story tags, or shop link"
                : "Upload customer moments, event decorations, or bouquet showcase"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border-theme text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-hover-theme transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="gallery-form"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white text-xs font-black shadow-lg shadow-primary/25 disabled:opacity-50 transition flex items-center gap-2"
          >
            <Save size={15} />
            {saving ? "Saving..." : item?._id ? "Save Changes" : "Save Media Item"}
          </button>
        </div>
      </div>

      {/* Main Grid: Form Inputs (7 Cols) + Live Preview (5 Cols) */}
      <form id="gallery-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Section */}
        <div className="lg:col-span-7 space-y-6">
          {/* Media Asset Box */}
          <div className="p-5 rounded-2xl border border-border-theme bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ImageIcon size={14} className="text-primary" />
              Media Visual & Type
            </h3>

            {/* Media Type Switcher */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMediaType("image")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition ${
                  mediaType === "image"
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : "border-border-theme text-slate-600 dark:text-slate-300 hover:bg-hover-theme"
                }`}
              >
                <ImageIcon size={15} />
                Photo Showcase
              </button>
              <button
                type="button"
                onClick={() => setMediaType("video")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition ${
                  mediaType === "video"
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : "border-border-theme text-slate-600 dark:text-slate-300 hover:bg-hover-theme"
                }`}
              >
                <Film size={15} />
                Video Reel
              </button>
            </div>

            {/* Image URL + Media Gallery Button */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {mediaType === "video" ? "Video Cover / Thumbnail Image" : "High-Resolution Image URL"} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... or choose from gallery"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaModal(true)}
                  className="px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl flex items-center gap-1.5 transition shrink-0"
                >
                  <Upload size={14} />
                  Media Gallery
                </button>
              </div>
            </div>

            {/* Video URL (if video type) */}
            {mediaType === "video" && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Video size={13} className="text-primary" />
                  Video URL (YouTube / Instagram Reel / MP4)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
          </div>

          {/* Details Box */}
          <div className="p-5 rounded-2xl border border-border-theme bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Tag size={14} className="text-primary" />
              Content Details & Story
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Item Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midnight Red Rose Cascade Bouquet"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Category Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__custom__">+ Custom Category...</option>
                </select>
              </div>

              {category === "__custom__" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Custom Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Anniversary"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Heart size={13} className="text-rose-500 fill-rose-500" />
                  Initial Likes Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={likes}
                  onChange={(e) => setLikes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Caption / Story */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Caption / Celebration Story
              </label>
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Share the story behind this delivery or setup..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Hashtags / Search Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="#midnightdelivery, #roses, #luxuryhamper"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Linked Product ("Shop This Look") */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ShoppingBag size={13} className="text-primary" />
                Linked Product (&ldquo;Shop This Look&rdquo; on Mobile App)
              </label>
              <select
                value={linkedProductId}
                onChange={(e) => setLinkedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">-- No Linked Product (Media Only) --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (₹{p.price})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Linking a product allows app users to tap &ldquo;Shop This Item&rdquo; directly from the photo!
              </span>
            </div>
          </div>

          {/* Visibility & Priority Box */}
          <div className="p-5 rounded-2xl border border-border-theme bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Hash size={14} className="text-primary" />
              Display & Priority
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  #0 appears at top of feed
                </span>
              </div>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-theme bg-card cursor-pointer hover:bg-hover-theme transition">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Live Status
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Visible on app/web
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-theme bg-card cursor-pointer hover:bg-hover-theme transition">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    Featured
                    <Sparkles size={11} className="text-amber-500" />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Home feed showcase
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Sticky Live Preview Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye size={13} className="text-primary" />
                Live Card Preview
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                WYSIWYG
              </span>
            </div>

            {/* Gallery Card Preview */}
            <div className="rounded-3xl border border-border-theme bg-card overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl">
              {/* Media Thumbnail */}
              <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={title || "Preview"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon size={44} className="opacity-40 mb-2" />
                    <span className="text-xs">No image selected</span>
                  </div>
                )}

                {/* Dark gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-sm backdrop-blur-md">
                    {category === "__custom__" ? customCategory || "Custom" : category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {mediaType === "video" && (
                      <span className="p-1.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                        <Play size={12} className="fill-white" />
                      </span>
                    )}
                    {isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                        <Sparkles size={11} />
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Overlay Title & Likes */}
                <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-extrabold line-clamp-1">
                      {title || "Celebration Delivery Moment"}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm shrink-0">
                      <Heart size={11} className="fill-rose-500 text-rose-500" />
                      {likes}
                    </span>
                  </div>

                  {caption && (
                    <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed">
                      {caption}
                    </p>
                  )}
                </div>
              </div>

              {/* Linked Product Preview Bar */}
              {selectedProduct && (
                <div className="p-3 bg-primary/10 border-t border-primary/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShoppingBag size={14} className="text-primary shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {selectedProduct.name}
                      </div>
                      <div className="text-[10px] text-primary font-bold">
                        ₹{selectedProduct.price}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-primary text-white shrink-0">
                    Shop Look
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border-theme text-xs text-slate-500 space-y-1">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                📸 Mobile App Showcase
              </div>
              <p className="text-[11px] leading-relaxed">
                Featured items appear in the horizontal carousel on the mobile home screen and receive top priority in the app gallery feed.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="lg:col-span-12 mt-6 pt-5 border-t border-border-theme flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border-theme shadow-sm">
          <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">
              {item?._id
                ? "Editing celebration media — App and website sync automatically."
                : "Ready to save celebration moment — Will appear immediately on active layout."}
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-border-theme text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-hover-theme transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-initial px-8 py-3 rounded-xl bg-primary hover:opacity-90 text-white text-xs font-black shadow-lg shadow-primary/30 disabled:opacity-50 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Save size={16} />
              <span>{saving ? "Saving..." : item?._id ? "Save Changes" : "Save Media Item"}</span>
            </button>
          </div>
        </div>
      </form>

      {showMediaModal && (
        <MediaModal
          onClose={() => setShowMediaModal(false)}
          onSelect={(url) => {
            setImage(url as string);
            setShowMediaModal(false);
          }}
          multiple={false}
        />
      )}
    </div>
  );
}
