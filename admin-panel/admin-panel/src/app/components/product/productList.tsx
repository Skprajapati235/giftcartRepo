"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { Search, LayoutGrid, List, MoreHorizontal, Trash2, Edit3, Box, Eye } from "lucide-react";
import Pagination from "../Pagination";
import { TableSkeleton, CardGridSkeleton } from "../skeletonLoader/commonSkeleton";

interface ProductListProps {
  products: any[];
  loading: boolean;
  onEdit: (product: any) => void;
  onView: (product: any) => void;
  onDelete: (id: string) => void;
}

export default function ProductList({ products, loading, onEdit, onView, onDelete }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name?.toLowerCase().includes(normalizedSearch) ||
        product.category?.name?.toLowerCase().includes(normalizedSearch)
      ),
    [products, normalizedSearch]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / 10));
  const currentProducts = filteredProducts.slice((currentPage - 1) * 10, currentPage * 10);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch]);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setOpenMenuId(null);
      onDelete(id);
    }
  };

  const handleEditClick = (p: any) => {
    setOpenMenuId(null);
    onEdit(p);
  };

  return (
    <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden min-h-[400px]">
      {/* Table Header Filter Bar */}
      <div className="p-6 border-b border-border-theme flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card relative z-10">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-hover-theme text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-background p-1 rounded-xl border border-border-theme">
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-lg transition ${viewMode === "card" ? "bg-card shadow-md text-primary" : "text-slate-400 hover:text-foreground"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-card shadow-md text-primary" : "text-slate-400 hover:text-foreground"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        viewMode === "list" ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (
          <CardGridSkeleton count={8} />
        )
      ) : filteredProducts.length === 0 ? (
        <div className="p-20 text-center text-slate-400 italic">No products found for your search.</div>
      ) : viewMode === "list" ? (
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="bg-th-bg text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-border-theme">
                <th className="px-6 py-4 w-[35%]">Name</th>
                <th className="px-6 py-4 w-[25%]">Description</th>
                <th className="px-6 py-4 w-[20%]">Created At</th>
                <th className="px-6 py-4 w-[12%]">Price</th>
                <th className="px-6 py-4 w-[8%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {currentProducts.map((p) => (
                <tr key={p._id} className="hover:bg-hover-theme transition-colors group border-b border-border-theme/50">
                  <td className="px-6 py-5 overflow-hidden">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl border border-border-theme bg-hover-theme overflow-hidden shrink-0">
                        {p.image ? <img src={p.image} className="h-full w-full object-cover" /> : <Box className="h-full w-full p-3 text-slate-300" />}
                      </div>
                      <span className="font-bold text-foreground truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-slate-500 text-sm truncate">{p.description}</p>
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm">
                    {new Date(p.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-hover-theme text-foreground/80 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap">
                      ₹{p.salePrice || p.price}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === p._id ? null : p._id)}
                      className="p-2 text-slate-400 hover:text-foreground transition rounded-xl"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {openMenuId === p._id && (
                      <div
                        ref={menuRef}
                        className="absolute right-6 top-14 w-44 bg-card rounded-2xl shadow-2xl border border-border-theme py-2 z-50 animate-in fade-in zoom-in duration-200"
                      >
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card View Mode */
        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 bg-background/50">
          {currentProducts.map((p) => (
            <div key={p._id} className="bg-card rounded-3xl p-4 border border-border-theme shadow-lg hover:shadow-primary/5 transition hover:-translate-y-1">
              <div className="h-44 w-full rounded-2xl overflow-hidden bg-background border border-border-theme mb-4">
                {p.image ? <img src={p.image} className="h-full w-full object-cover" /> : <Box className="p-10 text-slate-200" />}
              </div>
              <div className="px-1">
                <h4 className="font-bold text-foreground truncate">{p.name}</h4>
                <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">{p.category?.name || "No Category"}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-primary font-extrabold">₹{p.salePrice || p.price}</span>
                  <div className="flex gap-1">
                    <button onClick={() => onView(p)} className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-hover-theme"><Eye size={16} /></button>
                    <button onClick={() => handleEditClick(p)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-500/10"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(p._id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-500/10"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-6 border-t border-border-theme bg-card flex items-center justify-between">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
          Showing {(currentPage - 1) * 10 + Math.min(1, filteredProducts.length)}-{Math.min(currentPage * 10, filteredProducts.length)} of {filteredProducts.length}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
