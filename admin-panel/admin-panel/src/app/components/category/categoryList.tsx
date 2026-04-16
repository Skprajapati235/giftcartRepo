"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { Search, MoreHorizontal, Trash2, Edit3, Tag } from "lucide-react";
import Pagination from "../Pagination";
import { TableSkeleton } from "../skeletonLoader/commonSkeleton";

interface CategoryListProps {
  categories: any[];
  loading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onEdit: (category: any) => void;
  onDelete: (id: string) => void;
}

export default function CategoryList({ 
  categories, 
  loading, 
  total,
  totalPages,
  currentPage,
  searchTerm,
  onPageChange,
  onSearchChange,
  onEdit, 
  onDelete 
}: CategoryListProps) {
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

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setOpenMenuId(null);
      onDelete(id);
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border-theme bg-card relative z-10">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={7} cols={4} />
      ) : categories.length === 0 ? (
        <div className="p-20 text-center text-slate-400 italic">No categories found.</div>
      ) : (
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="bg-th-bg text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-border-theme">
                <th className="px-6 py-4 w-[15%]">Image</th>
                <th className="px-6 py-4 w-[45%]">Name</th>
                <th className="px-6 py-4 w-[30%]">Created At</th>
                <th className="px-6 py-4 w-[10%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-hover-theme transition-all duration-300 group border-b border-border-theme/50">
                  <td className="px-6 py-5">
                    <div className="h-10 w-14 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                      {c.image ? <img src={c.image} className="h-full w-full object-cover" /> : <Tag className="h-full w-full p-3 text-slate-200" />}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-slate-900">{c.name}</span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm">
                    {new Date(c.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 text-right relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === c._id ? null : c._id)}
                      className="p-2 text-slate-400 hover:text-slate-900 transition rounded-xl"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    
                    {openMenuId === c._id && (
                      <div 
                        ref={menuRef}
                        className="absolute right-6 top-14 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200"
                      >
                        <button 
                          onClick={() => { setOpenMenuId(null); onEdit(c); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Edit3 size={16} className="text-blue-600" />
                          Edit Category
                        </button>
                        <button 
                          onClick={() => handleDelete(c._id)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition"
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
      )}

      <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
          Showing {(currentPage - 1) * 10 + Math.min(1, categories.length)}-{Math.min(currentPage * 10, total)} of {total}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
