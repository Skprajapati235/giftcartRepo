"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageButton = (page: number) => (
    <button
      key={page}
      type="button"
      onClick={() => onPageChange(page)}
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${page === currentPage ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
    >
      {page}
    </button>
  );

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-6 flex items-center justify-between border-t border-border-theme pt-6">
      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest font-sans">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-2 rounded-xl bg-hover-theme px-5 py-2.5 text-sm font-bold text-foreground transition hover:opacity-80 disabled:opacity-30 border border-border-theme"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 rounded-xl bg-hover-theme px-5 py-2.5 text-sm font-bold text-foreground transition hover:opacity-80 disabled:opacity-30 border border-border-theme"
        >
          Next
        </button>
      </div>
    </div>
  );
}
