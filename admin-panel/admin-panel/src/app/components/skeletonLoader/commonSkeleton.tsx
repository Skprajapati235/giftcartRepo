"use client";

import React from "react";

// ─── Shimmer animation injected once ─────────────────────────────────────────
const ShimmerStyle = () => (
  <style>{`
    @keyframes skeleton-shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    .skeleton-shimmer {
      background: linear-gradient(
        90deg,
        var(--skeleton-base, #e2e8f0) 25%,
        var(--skeleton-highlight, #f8fafc) 50%,
        var(--skeleton-base, #e2e8f0) 75%
      );
      background-size: 1200px 100%;
      animation: skeleton-shimmer 1.6s ease-in-out infinite;
      border-radius: 0.5rem;
    }
    .dark .skeleton-shimmer {
      --skeleton-base: #1e293b;
      --skeleton-highlight: #334155;
    }
  `}</style>
);

// ─── Primitive box ─────────────────────────────────────────────────────────────
interface BoxProps {
  className?: string;
  style?: React.CSSProperties;
}
const SkeletonBox: React.FC<BoxProps> = ({ className = "", style }) => (
  <div className={`skeleton-shimmer ${className}`} style={style} />
);

// ═══════════════════════════════════════════════════════════════════════════════
// 1. TABLE SKELETON  — replaces "Fetching …" text inside a <table>
// ═══════════════════════════════════════════════════════════════════════════════
export interface TableSkeletonProps {
  /** Number of fake rows to render (default 6) */
  rows?: number;
  /** Number of columns to render (default 5) */
  cols?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 6,
  cols = 5,
}) => (
  <>
    <ShimmerStyle />
    <div className="overflow-x-auto w-full px-2 py-4 space-y-3">
      {/* fake header */}
      <div className="flex gap-4 px-4 pb-3 border-b border-border-theme/40">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBox
            key={i}
            className="h-3 flex-1 rounded-full"
            style={{ maxWidth: i === 0 ? "8rem" : undefined }}
          />
        ))}
      </div>

      {/* fake rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 px-4 py-3 rounded-xl"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="flex-1 flex items-center gap-3">
              {/* first column gets an avatar circle */}
              {c === 0 && (
                <SkeletonBox className="h-9 w-9 rounded-xl shrink-0" />
              )}
              <SkeletonBox
                className="h-3 rounded-full"
                style={{ width: `${55 + Math.random() * 35}%` }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  </>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. STAT-CARD SKELETON  — replaces dashboard summary cards
// ═══════════════════════════════════════════════════════════════════════════════
export interface StatCardSkeletonProps {
  /** How many cards (default 4) */
  count?: number;
}

export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({
  count = 4,
}) => (
  <>
    <ShimmerStyle />
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-3xl p-6 border border-border-theme shadow-sm space-y-4"
        >
          <SkeletonBox className="h-3 w-20 rounded-full" />
          <SkeletonBox className="h-8 w-28 rounded-xl" />
          <SkeletonBox className="h-2.5 w-16 rounded-full opacity-60" />
        </div>
      ))}
    </div>
  </>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. PRODUCT-CARD SKELETON  — replaces product grid cards
// ═══════════════════════════════════════════════════════════════════════════════
export interface CardGridSkeletonProps {
  /** How many cards (default 8) */
  count?: number;
}

export const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({
  count = 8,
}) => (
  <>
    <ShimmerStyle />
    <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 bg-background/50">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-3xl p-4 border border-border-theme shadow-sm space-y-4"
        >
          <SkeletonBox className="h-44 w-full rounded-2xl" />
          <SkeletonBox className="h-3.5 w-3/4 rounded-full" />
          <SkeletonBox className="h-2.5 w-1/3 rounded-full opacity-60" />
          <div className="flex justify-between items-center pt-1">
            <SkeletonBox className="h-4 w-16 rounded-lg" />
            <SkeletonBox className="h-8 w-16 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CHART SKELETON — replaces dashboard bar/pie charts
// ═══════════════════════════════════════════════════════════════════════════════
export const ChartSkeleton: React.FC = () => (
  <div className="grid gap-8 lg:grid-cols-2">
    {[0, 1].map((s) => (
      <div
        key={s}
        className="bg-card rounded-3xl p-6 border border-border-theme shadow-sm space-y-6"
      >
        <div className="space-y-2">
          <SkeletonBox className="h-5 w-40 rounded-full" />
          <SkeletonBox className="h-3 w-64 rounded-full opacity-60" />
        </div>
        <div className="h-[280px] w-full flex items-end gap-3 px-2">
          {s === 0 ? (
            // Bar Chart fake
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBox
                key={i}
                className="flex-1 rounded-t-xl"
                style={{ height: `${30 + Math.random() * 60}%` }}
              />
            ))
          ) : (
            // Pie Chart fake
            <div className="w-full flex items-center justify-center">
               <div className="relative h-48 w-48 rounded-full border-[16px] border-slate-200 dark:border-slate-800 animate-pulse">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full border-[12px] border-slate-100 dark:border-slate-700 opacity-50" />
                  </div>
               </div>
            </div>
          )}
        </div>
        <div className="flex justify-center gap-4">
           <SkeletonBox className="h-2 w-16 rounded-full" />
           <SkeletonBox className="h-2 w-16 rounded-full" />
           <SkeletonBox className="h-2 w-16 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. DASHBOARD SECTION SKELETON  — stat cards + Charts + two mini-tables
// ═══════════════════════════════════════════════════════════════════════════════
export const DashboardSkeleton: React.FC = () => (
  <>
    <ShimmerStyle />
    <div className="space-y-10 w-full animate-in fade-in duration-500">
      <StatCardSkeleton count={4} />

      <ChartSkeleton />

      <div className="grid gap-8 lg:grid-cols-2">
        {[0, 1].map((s) => (
          <div
            key={s}
            className="bg-card rounded-3xl p-6 border border-border-theme shadow-sm space-y-4"
          >
            <SkeletonBox className="h-4 w-36 rounded-full mb-2" />
            <TableSkeleton rows={5} cols={3} />
          </div>
        ))}
      </div>
    </div>
  </>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. GENERIC ROW SKELETON  — simple list of lines (payments, etc.)
// ═══════════════════════════════════════════════════════════════════════════════
export interface RowSkeletonProps {
  rows?: number;
}

export const RowSkeleton: React.FC<RowSkeletonProps> = ({ rows = 8 }) => (
  <>
    <ShimmerStyle />
    <div className="w-full space-y-3 p-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <SkeletonBox className="h-4 flex-1 rounded-full" />
          <SkeletonBox className="h-4 w-24 rounded-full" />
          <SkeletonBox className="h-4 w-20 rounded-full" />
          <SkeletonBox className="h-6 w-16 rounded-xl" />
        </div>
      ))}
    </div>
  </>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Default export — re-exports everything for convenience
// ═══════════════════════════════════════════════════════════════════════════════
export default {
  TableSkeleton,
  StatCardSkeleton,
  CardGridSkeleton,
  DashboardSkeleton,
  ChartSkeleton,
  RowSkeleton,
};
