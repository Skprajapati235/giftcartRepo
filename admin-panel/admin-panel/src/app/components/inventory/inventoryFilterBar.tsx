"use client";

import React from "react";
import { Search, X, FileSpreadsheet, FileText, ArrowUpDown, Filter, Loader2, RefreshCw } from "lucide-react";

interface CategoryOption {
  _id: string;
  name: string;
}

interface InventoryFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "in_stock" | "low_stock" | "out_of_stock";
  onStatusChange: (status: "all" | "in_stock" | "low_stock" | "out_of_stock") => void;
  selectedCategory: string;
  onCategoryChange: (catId: string) => void;
  categories: CategoryOption[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (field: any, order: "asc" | "desc") => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  isExportingExcel: boolean;
  isExportingPdf: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  counts?: {
    all: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
  };
}

export default function InventoryFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortBy,
  sortOrder,
  onSortChange,
  onExportExcel,
  onExportPdf,
  isExportingExcel,
  isExportingPdf,
  onRefresh,
  isRefreshing,
  counts,
}: InventoryFilterBarProps) {
  const statusTabs = [
    { key: "all" as const, label: "All Items", count: counts?.all },
    { key: "in_stock" as const, label: "In Stock", count: counts?.in_stock, color: "text-emerald-600 dark:text-emerald-400" },
    { key: "low_stock" as const, label: "Low Stock", count: counts?.low_stock, color: "text-amber-600 dark:text-amber-400" },
    { key: "out_of_stock" as const, label: "Out of Stock", count: counts?.out_of_stock, color: "text-rose-600 dark:text-rose-400" },
  ];

  return (
    <div className="mb-6 space-y-4 rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
      {/* Top Row: Search + Status Tabs + Export Buttons */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by product, SKU, bouquet flowers..."
            className="w-full rounded-xl border border-border-theme bg-background pl-10 pr-9 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Action Buttons: Export Excel + PDF + Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Inventory"
            className="rounded-xl border border-border-theme bg-background p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </button>

          {/* Export to Excel */}
          <button
            onClick={onExportExcel}
            disabled={isExportingExcel}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isExportingExcel ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>Export Excel (.csv)</span>
          </button>

          {/* Export to PDF */}
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isExportingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            )}
            <span>Export PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Status Tabs + Dropdown Filters */}
      <div className="flex flex-col gap-3 pt-2 border-t border-border-theme lg:flex-row lg:items-center lg:justify-between">
        {/* Status Pill Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onStatusChange(tab.key)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-background border border-border-theme text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
                      active
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dropdowns: Category + Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split("-");
                onSortChange(f, o as "asc" | "desc");
              }}
              className="bg-transparent text-xs sm:text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="createdAt-desc">Newest Added</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="stock-desc">Stock: High to Low</option>
              <option value="valuation-desc">Valuation: High to Low</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
