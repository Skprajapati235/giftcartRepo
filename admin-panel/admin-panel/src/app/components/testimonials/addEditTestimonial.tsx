"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  Upload,
  Globe,
  CheckCircle,
  Video,
  Quote,
  Sparkles,
  Eye,
  Hash,
  Building,
  User,
  MessageSquare,
  Check,
  Save,
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import MediaModal from "../ui/MediaModal";
import {
  createTestimonial,
  updateTestimonial,
  Testimonial,
} from "../../services/testimonialService";

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

interface AddEditTestimonialProps {
  testimonial?: Testimonial | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const PLATFORM_OPTIONS = [
  { value: "website", label: "Direct Website", icon: Globe, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800" },
  { value: "google", label: "Google Reviews", icon: Sparkles, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
  { value: "instagram", label: "Instagram", icon: InstagramIcon, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800" },
  { value: "trustpilot", label: "Trustpilot", icon: CheckCircle, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
  { value: "facebook", label: "Facebook", icon: Globe, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800" },
  { value: "other", label: "Other Source", icon: MessageSquare, color: "text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" },
];

export default function AddEditTestimonial({
  testimonial,
  onClose,
  onSuccess,
}: AddEditTestimonialProps) {
  const { showToast } = useToast();

  const [name, setName] = useState(testimonial?.name || "");
  const [designation, setDesignation] = useState(testimonial?.designation || "");
  const [company, setCompany] = useState(testimonial?.company || "");
  const [avatar, setAvatar] = useState(testimonial?.avatar || "");
  const [rating, setRating] = useState<number>(testimonial?.rating ?? 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState(testimonial?.title || "");
  const [message, setMessage] = useState(testimonial?.message || "");
  const [platform, setPlatform] = useState<Testimonial["platform"]>(testimonial?.platform || "website");
  const [videoUrl, setVideoUrl] = useState(testimonial?.videoUrl || "");
  const [order, setOrder] = useState<number>(testimonial?.order ?? 0);
  const [isActive, setIsActive] = useState<boolean>(testimonial?.isActive !== false);
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(testimonial?.isFeatured));

  const [saving, setSaving] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  useEffect(() => {
    if (testimonial) {
      setName(testimonial.name || "");
      setDesignation(testimonial.designation || "");
      setCompany(testimonial.company || "");
      setAvatar(testimonial.avatar || "");
      setRating(testimonial.rating ?? 5);
      setTitle(testimonial.title || "");
      setMessage(testimonial.message || "");
      setPlatform(testimonial.platform || "website");
      setVideoUrl(testimonial.videoUrl || "");
      setOrder(testimonial.order ?? 0);
      setIsActive(testimonial.isActive !== false);
      setIsFeatured(Boolean(testimonial.isFeatured));
    }
  }, [testimonial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Please enter customer name", "error");
      return;
    }
    if (!message.trim()) {
      showToast("Please enter testimonial message", "error");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Testimonial> = {
        name: name.trim(),
        designation: designation.trim(),
        company: company.trim(),
        avatar: avatar.trim(),
        rating,
        title: title.trim(),
        message: message.trim(),
        platform,
        videoUrl: videoUrl.trim(),
        order: Number(order) || 0,
        isActive,
        isFeatured,
      };

      if (testimonial?._id) {
        await updateTestimonial(testimonial._id, payload);
        showToast("Testimonial updated successfully! ✨", "success");
      } else {
        await createTestimonial(payload);
        showToast("Testimonial created successfully! 🎉", "success");
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to save testimonial", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectedPlatform = PLATFORM_OPTIONS.find((p) => p.value === platform) || PLATFORM_OPTIONS[0];

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
              {testimonial?._id ? "Edit Testimonial" : "Create New Testimonial"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {testimonial?._id
                ? "Modify customer review, ratings, media, and priority display"
                : "Add new verified customer feedback to display on storefront & app"}
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
            form="testimonial-form"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white text-xs font-black shadow-lg shadow-primary/25 disabled:opacity-50 transition flex items-center gap-2"
          >
            <Save size={15} />
            {saving ? "Saving..." : testimonial?._id ? "Save Changes" : "Save Testimonial"}
          </button>
        </div>
      </div>

      {/* Main Grid: Form Inputs (7 Cols) + Live Preview (5 Cols) */}
      <form id="testimonial-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Section */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Details Box */}
          <div className="p-5 rounded-2xl border border-border-theme bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <User size={14} className="text-primary" />
              Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pooja Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Role / Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Verified Buyer, Bride"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building size={13} className="text-primary" />
                  Company or City
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Bengaluru / Infosys"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Review Source Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Avatar URL + Media Browser */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Profile Avatar / Photo
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
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
          </div>

          {/* Review Content Box */}
          <div className="p-5 rounded-2xl border border-border-theme bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Quote size={14} className="text-primary rotate-180" />
              Rating & Testimonial Story
            </h3>

            {/* Star Rating Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Star size={13} className="text-amber-500 fill-amber-500" />
                Rating Score ({rating} of 5 Stars)
              </label>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border-theme bg-card">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const active = (hoverRating ?? rating) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(starVal)}
                        className="p-1 text-slate-300 hover:scale-125 transition-transform"
                      >
                        <Star
                          size={24}
                          className={
                            active
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]"
                              : "text-slate-300 dark:text-slate-700"
                          }
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {rating === 5
                    ? "Outstanding 🌟 (5.0)"
                    : rating === 4
                    ? "Very Good 👍 (4.0)"
                    : rating === 3
                    ? "Average 👌 (3.0)"
                    : "Needs Attention ⚠️"}
                </span>
              </div>
            </div>

            {/* Title / Headline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Headline / Catchy Summary
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Astonishing Flowers & Timely Midnight Delivery!"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  Full Testimonial Text <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {message.length} characters
                </span>
              </div>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the full customer review or endorsement..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed"
              />
            </div>

            {/* Video Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Video size={13} className="text-primary" />
                Video Story URL (Optional)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Settings & Visibility Box */}
          <div className="p-5 rounded-2xl border border-border-theme bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Hash size={14} className="text-primary" />
              Display & Visibility Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Display Order */}
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
                  Lower numbers appear first (#0 is top)
                </span>
              </div>

              {/* Live Switch */}
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-theme bg-card cursor-pointer hover:bg-hover-theme transition">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Live Status
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Visible on storefront
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
              </label>

              {/* Featured Switch */}
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-theme bg-card cursor-pointer hover:bg-hover-theme transition">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    Featured
                    <Sparkles size={11} className="text-amber-500" />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Home carousel pin
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

        {/* Right Section: Sticky Real-time Live Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye size={13} className="text-primary" />
                Live Storefront Card Preview
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                WYSIWYG
              </span>
            </div>

            {/* Testimonial Card Preview */}
            <div className="relative p-6 sm:p-7 rounded-3xl bg-card border border-border-theme shadow-xl overflow-hidden transition-all duration-300">
              {/* Decorative watermark quote */}
              <Quote
                size={88}
                className="absolute -top-3 -right-2 text-primary/10 rotate-180 pointer-events-none select-none"
              />

              {/* Card Top: Platform Badge & Featured Badge */}
              <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${selectedPlatform.color}`}
                >
                  <selectedPlatform.icon size={13} />
                  {selectedPlatform.label}
                </span>

                {isFeatured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <Sparkles size={12} />
                    Featured
                  </span>
                )}
              </div>

              {/* Stars */}
              <div className="relative z-10 flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <Star
                    key={starVal}
                    size={17}
                    className={
                      starVal <= rating
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_1px_4px_rgba(251,191,36,0.4)]"
                        : "text-slate-200 dark:text-slate-700"
                    }
                  />
                ))}
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 ml-1.5">
                  {rating}.0
                </span>
              </div>

              {/* Headline */}
              <h4 className="relative z-10 text-base font-black text-slate-900 dark:text-white mb-2 leading-snug">
                {title || "“Astonishing Flowers & Timely Midnight Delivery!”"}
              </h4>

              {/* Feedback Body */}
              <p className="relative z-10 text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-5 mb-5">
                {message
                  ? `"${message}"`
                  : '"I ordered a midnight red roses bouquet with customized chocolate hamper for my sister\'s birthday. The flowers arrived completely fresh and exquisitely packed. Customer support was also very cooperative!"'}
              </p>

              {/* Video indicator */}
              {videoUrl && (
                <div className="relative z-10 mb-4 inline-flex items-center gap-1.5 text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                  <Video size={13} />
                  Watch Video Story
                </div>
              )}

              {/* Author Footer */}
              <div className="relative z-10 pt-4 border-t border-border-theme flex items-center gap-3.5">
                <div className="relative">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name || "Customer"}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-rose-400 text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {name ? name.charAt(0).toUpperCase() : "C"}
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-card ${
                      isActive ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {name || "Customer Name"}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {designation || "Verified Buyer"}
                    {company ? ` • ${company}` : ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick helper tip */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border-theme text-xs text-slate-500 space-y-1">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                ✨ Pro-tip for Maximum Conversions
              </div>
              <p className="text-[11px] leading-relaxed">
                Include customer location or company name alongside high-resolution profile pictures to build authentic trust.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="lg:col-span-12 mt-6 pt-5 border-t border-border-theme flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border-theme shadow-sm">
          <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">
              {testimonial?._id
                ? "Editing verified testimonial — Instant updates on web & app."
                : "Ready to save — Live preview updates dynamically on right."}
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
              <span>{saving ? "Saving..." : testimonial?._id ? "Save Changes" : "Save Testimonial"}</span>
            </button>
          </div>
        </div>
      </form>

      {showMediaModal && (
        <MediaModal
          onClose={() => setShowMediaModal(false)}
          onSelect={(url) => {
            setAvatar(url as string);
            setShowMediaModal(false);
          }}
          multiple={false}
        />
      )}
    </div>
  );
}
