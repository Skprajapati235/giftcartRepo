"use client";

import React from "react";
import { Edit2, Trash2, Search, SlidersHorizontal, CheckCircle2, XCircle } from "lucide-react";

interface HeroSlideListProps {
  slides: any[];
  loading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onEdit: (slide: any) => void;
  onDelete: (id: string) => void;
  onToggleActive?: (slide: any) => void;
}

export default function HeroSlideList({
  slides = [],
  loading = false,
  total = 0,
  totalPages = 1,
  currentPage = 1,
  searchTerm = "",
  onPageChange,
  onSearchChange,
  onEdit,
  onDelete,
  onToggleActive,
}: HeroSlideListProps) {
  return (
    <div className="bg-card rounded-3xl border border-border-theme p-6 shadow-sm">
      {/* Search and summary bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search slides by title, tag, CTA, category..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-border-theme bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900 dark:text-white font-bold">{slides.length}</span> of {total} slides
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3" />
          <p className="text-xs font-medium">Loading hero slides...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <SlidersHorizontal size={40} className="mx-auto mb-3 opacity-30 text-primary" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No Hero Slides Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No slides matching "${searchTerm}". Try a different keyword.`
              : "No hero slides configured yet. Click 'Add New Slide' above to add your first banner."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border-theme text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3 px-6">Slide Preview</th>
                <th className="py-3 px-4">Tag & Title</th>
                <th className="py-3 px-4">CTA & Target</th>
                <th className="py-3 px-4 text-center">Order</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {slides.map((slide) => {
                const imgUrl = slide.image || slide.img;
                return (
                  <tr key={slide._id} className="hover:bg-hover-theme/50 transition">
                    {/* Thumbnail Preview */}
                    <td className="py-4 px-6">
                      <div className="relative h-16 w-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-border-theme shrink-0 shadow-sm">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={slide.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-400 text-[10px]">
                            No image
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Tag & Title */}
                    <td className="py-4 px-4 max-w-xs">
                      {slide.tag ? (
                        <span className="inline-block text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-1">
                          ✨ {slide.tag}
                        </span>
                      ) : null}
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm whitespace-pre-line leading-tight">
                        {slide.title}
                      </h4>
                      {slide.desc ? (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{slide.desc}</p>
                      ) : null}
                    </td>

                    {/* CTA & Category Match */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className="inline-block text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg">
                          CTA: {slide.cta || "Shop Now"}
                        </span>
                        <div className="text-[11px] text-slate-500">
                          Target:{" "}
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {slide.categoryMatch || "All Products"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Display Order */}
                    <td className="py-4 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      #{slide.order ?? 0}
                    </td>

                    {/* Active Status */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleActive && onToggleActive(slide)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          slide.isActive !== false
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300"
                        }`}
                      >
                        {slide.isActive !== false ? (
                          <>
                            <CheckCircle2 size={13} /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={13} /> Inactive
                          </>
                        )}
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(slide)}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition"
                          title="Edit Slide"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(slide._id)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition"
                          title="Delete Slide"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border-theme">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-1.5 rounded-xl border border-border-theme text-xs font-bold disabled:opacity-40 hover:bg-hover-theme transition"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1.5 rounded-xl border border-border-theme text-xs font-bold disabled:opacity-40 hover:bg-hover-theme transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
