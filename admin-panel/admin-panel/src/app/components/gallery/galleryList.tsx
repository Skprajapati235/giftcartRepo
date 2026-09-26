"use client";

import React from "react";
import {
  Image as ImageIcon,
  Edit2,
  Trash2,
  Sparkles,
  Heart,
  Video,
  Play,
  Eye,
  EyeOff,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { GalleryItem } from "../../services/galleryService";

interface GalleryListProps {
  items: GalleryItem[];
  loading: boolean;
  viewMode: "grid" | "table";
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onEdit: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (item: GalleryItem, updates: { isActive?: boolean; isFeatured?: boolean }) => void;
  onOpenAdd: () => void;
}

export default function GalleryList({
  items,
  loading,
  viewMode,
  selectedIds,
  onSelectChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onOpenAdd,
}: GalleryListProps) {
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectChange(items.map((i) => i._id));
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-card border border-border-theme overflow-hidden animate-pulse"
          >
            <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800" />
            <div className="p-4 space-y-3">
              <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="flex items-center justify-between pt-2">
                <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="py-16 px-4 text-center rounded-3xl bg-card border border-border-theme">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
          <ImageIcon size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          No Gallery Media Found
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
          We couldn&apos;t find any photos or videos matching your search or active filter.
        </p>
        <button
          onClick={onOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/25 hover:opacity-90 transition"
        >
          Add First Media Item
        </button>
      </div>
    );
  }

  // 1. VISUAL MASONRY GRID CARDS VIEW
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item._id);

          return (
            <div
              key={item._id}
              className={`group flex flex-col justify-between rounded-3xl bg-card border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-border-theme hover:border-primary/40"
              }`}
            >
              {/* Media Card Top Image with Gradient & Overlay Badges */}
              <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                {/* Top Floating Row: Selection Checkbox & Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectItem(item._id)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer ring-2 ring-black/40"
                    />
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.mediaType === "video" && (
                      <span
                        title="Video Reel"
                        className="p-1.5 rounded-full bg-rose-500 text-white shadow-md"
                      >
                        <Play size={11} className="fill-white" />
                      </span>
                    )}

                    {item.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                        <Sparkles size={10} />
                        Featured
                      </span>
                    )}

                    <span className="text-[10px] font-mono text-white/90 font-semibold px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md">
                      #{item.order ?? 0}
                    </span>
                  </div>
                </div>

                {/* Bottom Overlay: Title & Likes */}
                <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-extrabold line-clamp-1">
                      {item.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md shrink-0">
                      <Heart size={11} className="fill-rose-500 text-rose-500" />
                      {item.likes ?? 0}
                    </span>
                  </div>

                  {item.caption ? (
                    <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Linked Product Bar (if attached) */}
              {item.linkedProduct && (
                <div className="px-4 py-2 bg-primary/5 border-t border-border-theme flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ShoppingBag size={13} className="text-primary shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.linkedProduct.name}
                    </span>
                  </div>
                  <span className="font-bold text-primary shrink-0">
                    ₹{item.linkedProduct.price}
                  </span>
                </div>
              )}

              {/* Card Footer: Status Toggles & Action Icons */}
              <div className="p-4 border-t border-border-theme flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Live Status Toggle */}
                  <button
                    title={item.isActive ? "Click to hide" : "Click to publish"}
                    onClick={() => onToggleStatus(item, { isActive: !item.isActive })}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                      item.isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {item.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    {item.isActive ? "Live" : "Draft"}
                  </button>

                  {/* Featured Toggle */}
                  <button
                    title={item.isFeatured ? "Remove from home" : "Feature on home"}
                    onClick={() => onToggleStatus(item, { isFeatured: !item.isFeatured })}
                    className={`p-1.5 rounded-xl transition ${
                      item.isFeatured
                        ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                        : "text-slate-400 hover:text-slate-600 hover:bg-hover-theme"
                    }`}
                  >
                    <Sparkles size={14} />
                  </button>
                </div>

                {/* Edit & Delete Action Icons */}
                <div className="flex items-center gap-1">
                  <button
                    title="Edit Item"
                    onClick={() => onEdit(item)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/10 rounded-xl transition"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    title="Delete Item"
                    onClick={() => onDelete(item._id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
                  >
                    <Trash2 size={14} />
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
                  checked={items.length > 0 && selectedIds.length === items.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
              </th>
              <th className="py-4 px-4">Media</th>
              <th className="py-4 px-4">Title & Story</th>
              <th className="py-4 px-4">Category</th>
              <th className="py-4 px-4">Type</th>
              <th className="py-4 px-4 text-center">Likes</th>
              <th className="py-4 px-4 text-center">Status</th>
              <th className="py-4 px-4 text-center">Featured</th>
              <th className="py-4 px-4 text-center">Order</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-theme text-xs">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item._id);

              return (
                <tr
                  key={item._id}
                  className={`hover:bg-hover-theme/60 transition ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectItem(item._id)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                  </td>

                  {/* Thumbnail Image */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="relative w-14 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-border-theme">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {item.mediaType === "video" && (
                        <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                          <Play size={10} className="fill-white" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Title & Caption */}
                  <td className="py-4 px-4 max-w-xs md:max-w-md">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </div>
                    {item.caption && (
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {item.caption}
                      </div>
                    )}
                    {item.linkedProduct && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-primary font-bold">
                        <ShoppingBag size={10} />
                        Linked: {item.linkedProduct.name}
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.category}
                    </span>
                  </td>

                  {/* Media Type */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.mediaType === "video"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {item.mediaType === "video" ? <Video size={10} /> : <ImageIcon size={10} />}
                      {item.mediaType}
                    </span>
                  </td>

                  {/* Likes */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                      <Heart size={12} className="fill-rose-500 text-rose-500" />
                      {item.likes ?? 0}
                    </span>
                  </td>

                  {/* Active Toggle */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => onToggleStatus(item, { isActive: !item.isActive })}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                        item.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {item.isActive ? "Live" : "Draft"}
                    </button>
                  </td>

                  {/* Featured Toggle */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => onToggleStatus(item, { isFeatured: !item.isFeatured })}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                        item.isFeatured
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Sparkles size={11} />
                      {item.isFeatured ? "Featured" : "Standard"}
                    </button>
                  </td>

                  {/* Order */}
                  <td className="py-4 px-4 text-center whitespace-nowrap font-mono text-[11px] text-slate-500">
                    #{item.order ?? 0}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Edit"
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => onDelete(item._id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                      >
                        <Trash2 size={14} />
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
