/** Shared admin list table classes — prevents row overlap on mobile */

export const adminTableWrapClass =
  "overflow-x-auto w-full max-w-full [-webkit-overflow-scrolling:touch]";

export const adminTableClass =
  "w-full min-w-[720px] text-left border-collapse";

/** Wider tables (products, orders, reviews) */
export const adminTableWideClass =
  "w-full min-w-[960px] text-left border-collapse";

export const adminTableHeadCellClass =
  "px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 sm:px-6 sm:py-4";

export const adminTableBodyCellClass =
  "px-4 py-4 align-middle sm:px-6 sm:py-5";
