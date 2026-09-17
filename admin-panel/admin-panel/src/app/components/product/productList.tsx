"use client";

import React, { useState, useEffect } from "react";
import { Search, LayoutGrid, List, MoreHorizontal, Trash2, Edit3, Box, Eye, Moon, Clock } from "lucide-react";
import Pagination from "../Pagination";
import { TableSkeleton, CardGridSkeleton } from "../skeletonLoader/commonSkeleton";
import {
  adminTableWrapClass,
  adminTableWideClass,
  adminTableHeadCellClass,
  adminTableBodyCellClass,
} from "../ui/adminTable";
import { useRowActionMenu, rowActionDropdownClass } from "../ui/useRowActionMenu";
import { getDeliveryHours, DeliveryHoursStatus } from "../../services/deliveryHoursService";

interface ProductListProps {
  products: any[];
  loading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  selectedCategory: string;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onCategoryChange: (id: string) => void;
  onEdit: (product: any) => void;
  onView: (product: any) => void;
  onDelete: (id: string) => void;
}

export default function ProductList({
  products,
  loading,
  total,
  totalPages,
  currentPage,
  searchTerm,
  selectedCategory,
  onPageChange,
  onSearchChange,
  onCategoryChange,
  onEdit,
  onView,
  onDelete
}: ProductListProps) {
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryHoursStatus | null>(null);
  useRowActionMenu(openMenuId, setOpenMenuId);

  useEffect(() => {
    getDeliveryHours().then((status) => setDeliveryStatus(status)).catch(() => {});
  }, []);

  const handleDelete = (id: string) => {
    setOpenMenuId(null);
    onDelete(id);
  };

  const handleEditClick = (p: any) => {
    setOpenMenuId(null);
    onEdit(p);
  };

  return (
    <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden min-h-[400px]">
      {/* Table Header Filter Bar */}
      <div className="p-4 sm:p-6 border-b border-border-theme flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card relative z-10">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center w-full min-w-0">
          <div className="relative w-full min-w-0 sm:max-w-sm sm:flex-1">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-hover-theme text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-background p-1 rounded-xl border border-border-theme">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-lg transition ${viewMode === "card" ? "bg-card shadow-md text-primary" : "text-slate-400 hover:text-foreground"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-card shadow-md text-primary" : "text-slate-400 hover:text-foreground"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Night Delivery Restriction Notice Banner */}
      {deliveryStatus?.isCurrentlyRestricted && (
        <div className="mx-6 my-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-rose-700 dark:text-rose-300 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-rose-500/20 p-2 text-rose-600 dark:text-rose-300">
              <Moon className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold">Night Delivery Paused (Restriction Active):</span> Products are currently marked unavailable for delivery.
              <span className="block text-[11px] text-rose-600/80 dark:text-rose-400/80 font-medium">
                {deliveryStatus.message || `Delivery services resume at ${deliveryStatus.nextAvailableTime || "7:00 AM"}.`}
              </span>
            </div>
          </div>
          <a
            href="/delivery-hours"
            className="font-bold text-rose-700 dark:text-rose-300 hover:underline shrink-0 text-xs px-3 py-1.5 rounded-xl border border-rose-500/20 bg-card/60"
          >
            Manage Operating Hours →
          </a>
        </div>
      )}

      {loading ? (
        viewMode === "list" ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (
          <CardGridSkeleton count={9} />
        )
      ) : products.length === 0 ? (
        <div className="p-20 text-center text-slate-400 italic">No products found for your search.</div>
      ) : viewMode === "list" ? (
        <div className={`${adminTableWrapClass} min-h-[400px]`}>
          <table className={adminTableWideClass}>
            <thead>
              <tr className="bg-th-bg border-b border-border-theme">
                <th className={adminTableHeadCellClass}>Name</th>
                <th className={adminTableHeadCellClass}>Description</th>
                <th className={adminTableHeadCellClass}>Created At</th>
                <th className={adminTableHeadCellClass}>Price</th>
                <th className={adminTableHeadCellClass}>Sales Price</th>
                <th className={adminTableHeadCellClass}>COD</th>
                <th className={`${adminTableHeadCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-hover-theme transition-colors group border-b border-border-theme/50">
                  <td className="px-6 py-5 overflow-hidden">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl border border-border-theme bg-hover-theme overflow-hidden shrink-0">
                        {p.image ? <img src={p.image} className="h-full w-full object-cover" /> : <Box className="h-full w-full p-3 text-slate-300" />}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-foreground truncate">{p.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.category?.name || 'No Category'}</span>
                          {p.flowerCount && (
                            <span className="text-[8px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-500/20">
                              🌸 {p.flowerCount}
                            </span>
                          )}
                          {!p.flowerCount && p.flowerCountOptions?.length > 0 && (
                            <span className="text-[8px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-500/20">
                              🌸 {p.flowerCountOptions.length} Sizes
                            </span>
                          )}
                          {p.deliveryTime && (
                            <span className="text-[8px] font-black text-primary bg-primary/5 px-1 rounded border border-primary/10">
                              {p.deliveryTime} Hours
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-slate-500 text-sm line-clamp-1">
                      {p.description}
                    </p>
                    {/* <p className="text-slate-500 text-sm truncate">{p.description}</p> */}
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm">
                    {new Date(p.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-hover-theme text-foreground/80 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap">
                      ₹{p.price || 0}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-hover-theme text-foreground/80 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap">
                      ₹{p.salePrice ?? p.price ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap ${p.isCodAvailable
                      ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                      : 'bg-red-500/10 text-red-600 border border-red-500/20'
                      }`}>
                      {p.isCodAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </td>
                  <td className={`${adminTableBodyCellClass} text-right`}>
                    <div className="relative inline-flex justify-end" data-row-action>
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === p._id ? null : p._id)}
                        className="p-2 text-slate-400 hover:text-foreground transition rounded-xl"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {openMenuId === p._id && (
                        <div className={rowActionDropdownClass}>
                          <button
                            onClick={() => { setOpenMenuId(null); onView(p); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-foreground hover:bg-hover-theme transition"
                          >
                            <Eye size={16} className="text-slate-500" />
                            View Details
                          </button>
                          <div className="mx-2 my-1 border-t border-border-theme" />
                          <button
                            onClick={() => handleEditClick(p)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-foreground hover:bg-hover-theme transition"
                          >
                            <Edit3 size={16} className="text-blue-600" />
                            Edit Product
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-500/10 transition"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6 lg:grid-cols-3 xl:grid-cols-3 bg-background/50">
          {products.map((p) => (
            <div key={p._id} className="bg-card rounded-3xl border border-border-theme shadow-lg hover:shadow-primary/10 transition relative isolate group">
              <div className="h-65 w-full rounded-2xl overflow-hidden bg-background border border-border-theme mb-4 relative">
                {p.image ? <img src={p.image} className="h-full w-full object-cover" /> : <Box className="p-10 text-slate-200" />}

                {/* Night restriction indicator badge */}
                {deliveryStatus?.isCurrentlyRestricted && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-rose-500/30 px-2.5 py-1 text-[10px] font-bold text-rose-400 shadow-md">
                    <Moon className="h-3 w-3 text-rose-400" />
                    <span>Night Paused</span>
                  </div>
                )}

                {/* Hover overlay: Currently Unavailable & Available After [Time] */}
                {deliveryStatus?.isCurrentlyRestricted && (
                  <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                    <span className="rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 shadow-sm">
                      <Moon className="h-3.5 w-3.5" />
                      Currently Unavailable
                    </span>
                    <p className="text-xs font-bold text-white leading-snug max-w-[210px]">
                      Will be available for delivery after{" "}
                      <span className="text-amber-400 font-extrabold underline decoration-amber-400/50">
                        {deliveryStatus.nextAvailableTime || deliveryStatus.formattedEnd || "7:00 AM"}
                      </span>
                    </p>
                    <span className="text-[10px] text-slate-400 mt-2 font-medium">
                      Night delivery paused
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-bold text-foreground truncate">{p.name}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">{p.category?.name || "No Category"}</p>
                  {p.flowerCount && (
                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-500/20">
                      🌸 {p.flowerCount}
                    </span>
                  )}
                  {!p.flowerCount && p.flowerCountOptions?.length > 0 && (
                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-500/20">
                      🌸 {p.flowerCountOptions.length} Sizes
                    </span>
                  )}
                </div>
                {/* <p className="text-sm text-slate-500 mt-2">{p.description}</p> */}
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                  {p.description}
                </p>

                {/* Price Section */}
                <div className="mt-4 flex items-center gap-2">
                  {p.discount > 0 || (p.salePrice && p.salePrice < p.price) ? (
                    <>
                      <span className="text-slate-400 line-through font-bold">₹{p.price}</span>
                      <span className="text-primary font-extrabold">₹{p.salePrice ?? p.price ?? 0}</span>
                    </>
                  ) : (
                    <span className="text-primary font-extrabold">₹{p.price || 0}</span>
                  )}
                </div>

                {/* Action Menu Like List */}
                <div className="absolute top-4 right-4 z-10" data-row-action>
                  <div className="relative inline-flex">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === p._id ? null : p._id)}
                      className="p-2 text-slate-400 hover:text-foreground transition rounded-xl bg-card/80 backdrop-blur-sm"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {openMenuId === p._id && (
                      <div className={rowActionDropdownClass}>
                        <button
                          onClick={() => { setOpenMenuId(null); onView(p); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-foreground hover:bg-hover-theme transition"
                        >
                          <Eye size={16} className="text-slate-500" />
                          View Details
                        </button>
                        <div className="mx-2 my-1 border-t border-border-theme" />
                        <button
                          onClick={() => handleEditClick(p)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-foreground hover:bg-hover-theme transition"
                        >
                          <Edit3 size={16} className="text-blue-600" />
                          Edit Product
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-6 border-t border-border-theme bg-card flex items-center justify-between">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
          Showing {(currentPage - 1) * 10 + Math.min(1, products.length)}-{Math.min(currentPage * 10, total)} of {total}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
