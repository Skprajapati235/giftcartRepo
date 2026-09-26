"use client";

import React, { useState } from "react";
import {
  Star,
  Quote,
  Edit2,
  Trash2,
  Sparkles,
  Globe,
  CheckCircle,
  Video,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Eye,
  EyeOff,
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
import { Testimonial } from "../../services/testimonialService";

interface TestimonialListProps {
  testimonials: Testimonial[];
  loading: boolean;
  viewMode: "grid" | "table";
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onEdit: (item: Testimonial) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (item: Testimonial, updates: { isActive?: boolean; isFeatured?: boolean }) => void;
  onOpenAddModal: () => void;
}

const PLATFORM_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  website: { label: "Website", icon: Globe, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800" },
  google: { label: "Google", icon: Sparkles, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
  instagram: { label: "Instagram", icon: InstagramIcon, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800" },
  trustpilot: { label: "Trustpilot", icon: CheckCircle, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
  facebook: { label: "Facebook", icon: Globe, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800" },
  other: { label: "Other", icon: MessageSquare, color: "text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" },
};

export default function TestimonialList({
  testimonials,
  loading,
  viewMode,
  selectedIds,
  onSelectChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onOpenAddModal,
}: TestimonialListProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectChange(testimonials.map((t) => t._id));
    } else {
      onSelectChange([]);
    }
  };

  const handleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  // Loading Skeletons
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-card border border-border-theme animate-pulse space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="w-full h-5 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="w-full h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="flex items-center gap-3 pt-3 border-t border-border-theme">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (testimonials.length === 0) {
    return (
      <div className="py-16 px-4 text-center rounded-3xl bg-card border border-border-theme">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
          <Quote size={32} className="rotate-180" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          No Testimonials Found
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
          We couldn&apos;t find any testimonials matching your filters or search criteria.
        </p>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/25 hover:opacity-90 transition"
        >
          Add First Testimonial
        </button>
      </div>
    );
  }

  // 1. GRID CARDS VIEW
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => {
          const platformInfo = PLATFORM_CONFIG[t.platform] || PLATFORM_CONFIG.website;
          const isExpanded = Boolean(expandedIds[t._id]);
          const isSelected = selectedIds.includes(t._id);

          return (
            <div
              key={t._id}
              className={`group relative flex flex-col justify-between p-6 rounded-3xl bg-card border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-border-theme hover:border-primary/40"
              }`}
            >
              {/* Background Quote Watermark */}
              <Quote
                size={88}
                className="absolute top-2 right-2 text-slate-100 dark:text-slate-800/40 rotate-180 pointer-events-none select-none transition-transform group-hover:scale-110"
              />

              {/* Card Top: Selection, Platform Badge, Priority & Featured Badge */}
              <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectItem(t._id)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${platformInfo.color}`}
                  >
                    <platformInfo.icon size={12} />
                    {platformInfo.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {t.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      <Sparkles size={11} />
                      Featured
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-slate-400 font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                    #{t.order ?? 0}
                  </span>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="relative z-10 flex items-center gap-1 mb-2.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    className={
                      star <= (t.rating ?? 5)
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_1px_3px_rgba(251,191,36,0.4)]"
                        : "text-slate-200 dark:text-slate-700"
                    }
                  />
                ))}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                  {t.rating ?? 5}.0
                </span>
              </div>

              {/* Title & Body */}
              <div className="relative z-10 flex-1 mb-5">
                {t.title && (
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">
                    {t.title}
                  </h4>
                )}
                <p
                  className={`text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic ${
                    isExpanded ? "" : "line-clamp-4"
                  }`}
                >
                  &ldquo;{t.message}&rdquo;
                </p>

                {t.message.length > 180 && (
                  <button
                    onClick={() => toggleExpand(t._id)}
                    className="mt-1.5 text-[11px] font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    {isExpanded ? (
                      <>
                        Show less <ChevronUp size={12} />
                      </>
                    ) : (
                      <>
                        Read more <ChevronDown size={12} />
                      </>
                    )}
                  </button>
                )}

                {/* Video Link Indicator */}
                {t.videoUrl && (
                  <a
                    href={t.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-xl hover:opacity-90 transition border border-rose-200 dark:border-rose-900/50"
                  >
                    <Video size={13} />
                    Watch Video Story
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>

              {/* Author Row */}
              <div className="relative z-10 pt-4 border-t border-border-theme flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {t.avatar ? (
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-rose-400 text-white flex items-center justify-center font-bold text-xs shadow-md">
                        {t.name ? t.name.charAt(0).toUpperCase() : "C"}
                      </div>
                    )}
                    <span
                      title={t.isActive ? "Live on Storefront" : "Hidden"}
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-card ${
                        t.isActive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {t.designation || "Customer"}
                      {t.company ? ` • ${t.company}` : ""}
                    </div>
                  </div>
                </div>

                {/* Card Quick Action Icons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    title={t.isActive ? "Click to hide" : "Click to show"}
                    onClick={() => onToggleStatus(t, { isActive: !t.isActive })}
                    className={`p-2 rounded-xl transition ${
                      t.isActive
                        ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>

                  <button
                    title="Edit Testimonial"
                    onClick={() => onEdit(t)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/10 rounded-xl transition"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    title="Delete Testimonial"
                    onClick={() => onDelete(t._id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 2. DENSE DATA TABLE VIEW
  return (
    <div className="rounded-3xl border border-border-theme bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-theme bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-4 w-10">
                <input
                  type="checkbox"
                  checked={
                    testimonials.length > 0 &&
                    selectedIds.length === testimonials.length
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
              </th>
              <th className="py-4 px-4">Customer</th>
              <th className="py-4 px-4">Headline & Feedback</th>
              <th className="py-4 px-4">Rating</th>
              <th className="py-4 px-4">Platform</th>
              <th className="py-4 px-4 text-center">Status</th>
              <th className="py-4 px-4 text-center">Featured</th>
              <th className="py-4 px-4 text-center">Order</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-theme text-xs">
            {testimonials.map((t) => {
              const platformInfo = PLATFORM_CONFIG[t.platform] || PLATFORM_CONFIG.website;
              const isSelected = selectedIds.includes(t._id);

              return (
                <tr
                  key={t._id}
                  className={`hover:bg-hover-theme/60 transition ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectItem(t._id)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                  </td>

                  {/* Customer Info */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {t.avatar ? (
                          <img
                            src={t.avatar}
                            alt={t.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-rose-400 text-white flex items-center justify-center font-bold text-xs">
                            {t.name ? t.name.charAt(0).toUpperCase() : "C"}
                          </div>
                        )}
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-card ${
                            t.isActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {t.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {t.designation || "Customer"}
                          {t.company ? ` • ${t.company}` : ""}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Feedback Message */}
                  <td className="py-4 px-4 max-w-xs md:max-w-md">
                    {t.title && (
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {t.title}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      &ldquo;{t.message}&rdquo;
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {t.rating ?? 5}.0
                      </span>
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${platformInfo.color}`}
                    >
                      <platformInfo.icon size={11} />
                      {platformInfo.label}
                    </span>
                  </td>

                  {/* Active Toggle */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => onToggleStatus(t, { isActive: !t.isActive })}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                        t.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {t.isActive ? "Live" : "Draft"}
                    </button>
                  </td>

                  {/* Featured Toggle */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => onToggleStatus(t, { isFeatured: !t.isFeatured })}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                        t.isFeatured
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Sparkles size={11} />
                      {t.isFeatured ? "Featured" : "Standard"}
                    </button>
                  </td>

                  {/* Order */}
                  <td className="py-4 px-4 text-center whitespace-nowrap font-mono text-[11px] text-slate-500">
                    #{t.order ?? 0}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Edit"
                        onClick={() => onEdit(t)}
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => onDelete(t._id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
