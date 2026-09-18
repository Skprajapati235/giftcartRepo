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
    <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 bg-background/50">
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
// 5. DASHBOARD SECTION SKELETON  — 1:1 pixel-perfect match of executive dashboard
// ═══════════════════════════════════════════════════════════════════════════════
export const DashboardSkeleton: React.FC = () => (
  <>
    <ShimmerStyle />
    <div className="space-y-4 sm:space-y-5 pb-8 w-full animate-in fade-in duration-300">
      {/* 1. Header Banner Skeleton */}
      <div className="rounded-2xl border border-border-theme bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <SkeletonBox className="h-5 w-32 rounded-full" />
              <SkeletonBox className="h-5 w-40 rounded-full" />
            </div>
            <SkeletonBox className="h-7 w-56 rounded-xl" />
            <SkeletonBox className="h-3.5 w-72 sm:w-80 rounded-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBox className="h-8 w-20 rounded-xl" />
            <SkeletonBox className="h-8 w-28 rounded-xl" />
            <SkeletonBox className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 2. KPI 4-Grid Cards Skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border-theme bg-card p-4 sm:p-4.5 shadow-sm space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <SkeletonBox className="h-9 w-9 rounded-xl shrink-0" />
                <SkeletonBox className="h-3.5 w-20 rounded-full" />
              </div>
              <SkeletonBox className="h-4 w-12 rounded-full" />
            </div>
            <SkeletonBox className="h-7 w-28 rounded-xl" />
            <SkeletonBox className="h-3 w-36 rounded-full" />
          </div>
        ))}
      </div>

      {/* 3. Operational Highlights Strip (3 Cards) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4 shadow-sm space-y-2"
          >
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-8 w-8 rounded-lg shrink-0" />
              <div className="space-y-1">
                <SkeletonBox className="h-3 w-24 rounded-full" />
                <SkeletonBox className="h-2 w-32 rounded-full" />
              </div>
            </div>
            <SkeletonBox className="h-6 w-24 rounded-xl" />
            <SkeletonBox className="h-2.5 w-36 rounded-full" />
          </div>
        ))}
      </div>

      {/* 4. Primary Sales & Revenue Area Chart Skeleton */}
      <div className="rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm space-y-3">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-8 w-8 rounded-lg shrink-0" />
              <SkeletonBox className="h-5 w-48 rounded-xl" />
            </div>
            <SkeletonBox className="h-3.5 w-64 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-7 w-36 rounded-xl" />
            <SkeletonBox className="h-7 w-36 rounded-xl" />
          </div>
        </div>

        {/* 3 Highlight metric boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-2.5 sm:p-3 rounded-xl border border-border-theme bg-background/60">
          <div>
            <SkeletonBox className="h-2.5 w-20 rounded-full mb-1" />
            <SkeletonBox className="h-5 w-24 rounded-lg" />
          </div>
          <div>
            <SkeletonBox className="h-2.5 w-20 rounded-full mb-1" />
            <SkeletonBox className="h-5 w-20 rounded-lg" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <SkeletonBox className="h-2.5 w-24 rounded-full mb-1" />
            <SkeletonBox className="h-5 w-16 rounded-lg" />
          </div>
        </div>

        {/* Chart canvas */}
        <SkeletonBox className="h-[200px] sm:h-[220px] w-full rounded-xl" />
      </div>

      {/* 5. Top Sellers & Payment Modes Grid Skeleton */}
      <div className="grid gap-3.5 sm:gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-8 w-8 rounded-lg shrink-0" />
              <div className="space-y-0.5">
                <SkeletonBox className="h-4 w-44 rounded-lg" />
                <SkeletonBox className="h-2.5 w-36 rounded-full" />
              </div>
            </div>
            <SkeletonBox className="h-5 w-16 rounded-full" />
          </div>
          <div className="space-y-2 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <SkeletonBox className="h-3 w-40 rounded-full" />
                  <SkeletonBox className="h-3 w-16 rounded-full" />
                </div>
                <SkeletonBox className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-8 w-8 rounded-lg shrink-0" />
            <div className="space-y-0.5">
              <SkeletonBox className="h-4 w-36 rounded-lg" />
              <SkeletonBox className="h-2.5 w-40 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-xl border border-border-theme space-y-1.5">
              <SkeletonBox className="h-2.5 w-14 rounded-full" />
              <SkeletonBox className="h-5 w-20 rounded-lg" />
              <SkeletonBox className="h-2 w-16 rounded-full" />
            </div>
            <div className="p-2.5 rounded-xl border border-border-theme space-y-1.5">
              <SkeletonBox className="h-2.5 w-14 rounded-full" />
              <SkeletonBox className="h-5 w-20 rounded-lg" />
              <SkeletonBox className="h-2 w-16 rounded-full" />
            </div>
          </div>
          <SkeletonBox className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* 6. Leads & Pipeline Funnel Grid Skeleton */}
      <div className="grid gap-3.5 sm:gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-8 w-8 rounded-lg shrink-0" />
              <SkeletonBox className="h-4 w-40 rounded-lg" />
            </div>
            <SkeletonBox className="h-4 w-20 rounded-full" />
          </div>
          <div className="space-y-2 pt-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <SkeletonBox className="h-3 w-28 rounded-full" />
                  <SkeletonBox className="h-3 w-14 rounded-full" />
                </div>
                <SkeletonBox className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-8 w-8 rounded-lg shrink-0" />
              <SkeletonBox className="h-4 w-40 rounded-lg" />
            </div>
            <SkeletonBox className="h-4 w-20 rounded-full" />
          </div>
          <div className="space-y-2 pt-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <SkeletonBox className="h-3 w-24 rounded-full" />
                  <SkeletonBox className="h-3 w-14 rounded-full" />
                </div>
                <SkeletonBox className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Fulfillment Donut & Support Health Skeleton */}
      <div className="grid gap-3.5 sm:gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-8 w-8 rounded-lg shrink-0" />
            <SkeletonBox className="h-4 w-44 rounded-lg" />
          </div>
          <div className="flex items-center justify-center py-2">
            <SkeletonBox className="h-32 w-32 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border-theme">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} className="h-3 w-full rounded-full" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-8 w-8 rounded-lg shrink-0" />
              <SkeletonBox className="h-4 w-40 rounded-lg" />
            </div>
            <SkeletonBox className="h-4 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-2 rounded-xl border border-border-theme space-y-1 text-center">
                <SkeletonBox className="h-2.5 w-12 rounded-full mx-auto" />
                <SkeletonBox className="h-5 w-10 rounded-lg mx-auto" />
                <SkeletonBox className="h-2 w-12 rounded-full mx-auto" />
              </div>
            ))}
          </div>
          <SkeletonBox className="h-8 w-full rounded-xl" />
        </div>
      </div>

      {/* 8. Category Stock Valuation 4-Card Skeleton */}
      <div className="rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-8 w-8 rounded-lg shrink-0" />
            <SkeletonBox className="h-4 w-52 rounded-lg" />
          </div>
          <SkeletonBox className="h-5 w-28 rounded-lg" />
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl border border-border-theme space-y-1.5">
              <div className="flex justify-between">
                <SkeletonBox className="h-3 w-24 rounded-full" />
                <SkeletonBox className="h-3 w-10 rounded-full" />
              </div>
              <SkeletonBox className="h-5 w-20 rounded-lg" />
              <SkeletonBox className="h-2.5 w-28 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* 9. Recent Activity: Orders & Payments Tables Skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, s) => (
          <div
            key={s}
            className="rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4.5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between border-b border-border-theme pb-2.5">
              <div className="flex items-center gap-2">
                <SkeletonBox className="h-8 w-8 rounded-lg shrink-0" />
                <div className="space-y-0.5">
                  <SkeletonBox className="h-3.5 w-32 rounded-lg" />
                  <SkeletonBox className="h-2 w-20 rounded-full" />
                </div>
              </div>
              <SkeletonBox className="h-5 w-16 rounded-lg" />
            </div>
            <div className="space-y-2 pt-0.5">
              {Array.from({ length: 5 }).map((_, r) => (
                <div key={r} className="flex items-center justify-between p-2 rounded-xl border border-border-theme/40">
                  <div className="flex items-center gap-2">
                    <SkeletonBox className="h-6 w-6 rounded-full shrink-0" />
                    <div className="space-y-1">
                      <SkeletonBox className="h-3 w-24 rounded-full" />
                      <SkeletonBox className="h-2 w-16 rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SkeletonBox className="h-4 w-16 rounded-full" />
                    <SkeletonBox className="h-3.5 w-12 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
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
