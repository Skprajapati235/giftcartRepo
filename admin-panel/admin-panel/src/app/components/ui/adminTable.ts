/** Shared admin list table classes — prevents row overlap on mobile with modern typography */

export const adminTableWrapClass =
  "overflow-x-auto w-full max-w-full [-webkit-overflow-scrolling:touch] min-h-[350px] pb-32";

export const adminTableClass =
  "w-full min-w-[720px] text-left border-collapse";

/** Wider tables (products, orders, reviews) */
export const adminTableWideClass =
  "w-full min-w-[960px] text-left border-collapse";

export const adminTableHeadCellClass =
  "px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:px-6 sm:py-4 select-none";

export const adminTableBodyCellClass =
  "px-5 py-4 align-middle text-sm text-slate-700 dark:text-slate-200 sm:px-6 sm:py-4.5";
