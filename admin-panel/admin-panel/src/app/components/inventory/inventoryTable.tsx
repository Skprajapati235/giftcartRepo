"use client";

import React from "react";
import { Package, Plus, Minus, Edit3, ArrowUpRight, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { InventoryItem } from "../../services/inventoryService";
import Pagination from "../Pagination";

interface InventoryTableProps {
  items: InventoryItem[];
  loading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  onPageChange: (page: number) => void;
  onQuickRestock: (item: InventoryItem) => void;
  onInlineAdjust: (item: InventoryItem, delta: number) => void;
  onEditProduct?: (productId: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
}

export default function InventoryTable({
  items,
  loading,
  total,
  totalPages,
  currentPage,
  limit,
  onPageChange,
  onQuickRestock,
  onInlineAdjust,
  onEditProduct,
  selectedIds,
  onToggleSelect,
  onSelectAll,
}: InventoryTableProps) {
  const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item._id));

  return (
    <div className="rounded-2xl border border-border-theme bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-theme bg-th-bg/60 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <th className="py-3.5 px-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-border-theme text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4">Product / SKU</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Pricing</th>
              <th className="py-3.5 px-4 text-center">Stock Level</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Valuation</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-theme text-xs sm:text-sm">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-slate-800" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4"><div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-6 w-24 mx-auto bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 w-16 ml-auto bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-8 w-20 ml-auto bg-slate-200 dark:bg-slate-800 rounded" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
                    <Package className="h-7 w-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">No products found</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Try adjusting your search query or filter options.
                  </p>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isSelected = selectedIds.includes(item._id);

                return (
                  <tr
                    key={item._id}
                    className={`transition-colors hover:bg-hover-theme/60 ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(item._id)}
                        className="rounded border-border-theme text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                      />
                    </td>

                    {/* Product / SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-11 w-11 shrink-0 rounded-xl object-cover border border-border-theme shadow-xs"
                          />
                        ) : (
                          <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 border border-border-theme flex items-center justify-center text-slate-400">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0 max-w-[240px]">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 border border-border-theme px-1.5 py-0.2 rounded font-semibold text-slate-800 dark:text-slate-200">
                              {item.sku}
                            </span>
                            {item.flowerCount && (
                              <span className="text-[10px] bg-pink-500/10 text-pink-600 dark:text-pink-400 px-1.5 py-0.2 rounded font-medium">
                                🌸 {item.flowerCount}
                              </span>
                            )}
                            {item.weight && (
                              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded font-medium">
                                🎂 {item.weight}
                              </span>
                            )}
                            {item.flowerCountOptions && item.flowerCountOptions.length > 0 && (
                              <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.2 rounded font-medium">
                                🌸 {item.flowerCountOptions.length} Sizes
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-border-theme">
                        {item.category?.name || "Uncategorized"}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          ₹{item.salePrice || item.price}
                        </div>
                        {item.salePrice && item.salePrice < item.price && (
                          <div className="text-[11px] text-slate-400 line-through">
                            ₹{item.price}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Stock Level (with inline +/- adjusters) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-2 py-1 shadow-2xs">
                        <button
                          onClick={() => onInlineAdjust(item, -1)}
                          disabled={item.stock <= 0}
                          title="Decrease Stock by 1"
                          className="rounded-lg p-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-9 text-center font-black text-sm text-slate-900 dark:text-white">
                          {item.stock}
                        </span>
                        <button
                          onClick={() => onInlineAdjust(item, 1)}
                          title="Increase Stock by 1"
                          className="rounded-lg p-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {item.stockStatus === "in_stock" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          In Stock
                        </span>
                      )}
                      {item.stockStatus === "low_stock" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <AlertCircle className="h-3 w-3" />
                          Low Stock ({item.stock} left)
                        </span>
                      )}
                      {item.stockStatus === "out_of_stock" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <XCircle className="h-3 w-3" />
                          Out of Stock
                        </span>
                      )}
                    </td>

                    {/* Valuation */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-slate-900 dark:text-white">
                        ₹{(item.totalValuation || 0).toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onQuickRestock(item)}
                          className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                        >
                          Restock
                        </button>
                        {onEditProduct && (
                          <button
                            onClick={() => onEditProduct(item._id)}
                            title="Edit Product Details"
                            className="rounded-xl border border-border-theme bg-background p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Summary Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border-theme bg-card">
        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          Showing{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {total === 0 ? 0 : (currentPage - 1) * limit + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {Math.min(currentPage * limit, total)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {total}
          </span>{" "}
          inventory items
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
