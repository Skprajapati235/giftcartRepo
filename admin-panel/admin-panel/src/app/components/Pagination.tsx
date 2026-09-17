"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safeCurrentPage = Math.max(1, Math.min(currentPage || 1, safeTotalPages));

  // Generate page numbers with windowing if many pages
  const getPageNumbers = () => {
    if (safeTotalPages <= 5) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, safeTotalPages];
    }
    if (safeCurrentPage >= safeTotalPages - 2) {
      return [1, safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages];
    }
    return [1, safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, safeTotalPages];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span className="text-xs font-bold text-slate-400 mr-2 hidden md:inline">
        Page {safeCurrentPage} of {safeTotalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(safeCurrentPage - 1)}
        disabled={safeCurrentPage <= 1}
        className="flex items-center gap-1 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold border border-border-theme bg-hover-theme text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        title="Previous Page"
      >
        <ChevronLeft size={14} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((p, idx) => {
          const showEllipsisBefore = idx > 0 && p - pageNumbers[idx - 1] > 1;
          return (
            <React.Fragment key={p}>
              {showEllipsisBefore && (
                <span className="px-1 text-slate-400 text-xs font-bold">...</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[32px] h-8 px-2.5 rounded-xl text-xs font-bold transition ${
                  p === safeCurrentPage
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-hover-theme text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 border border-border-theme"
                }`}
              >
                {p}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(safeCurrentPage + 1)}
        disabled={safeCurrentPage >= safeTotalPages}
        className="flex items-center gap-1 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold border border-border-theme bg-hover-theme text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        title="Next Page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
