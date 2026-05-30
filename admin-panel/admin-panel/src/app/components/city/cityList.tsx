"use client";

import React, { useState } from "react";
import { Search, MoreHorizontal, Trash2, Edit3, MapPin } from "lucide-react";
import Pagination from "../Pagination";
import { TableSkeleton } from "../skeletonLoader/commonSkeleton";
import { adminTableWrapClass, adminTableClass, adminTableHeadCellClass, adminTableBodyCellClass } from "../ui/adminTable";
import { useRowActionMenu, rowActionDropdownClass } from "../ui/useRowActionMenu";

interface CityListProps {
  cities: any[];
  loading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onEdit: (city: any) => void;
  onDelete: (id: string) => void;
}

export default function CityList({ 
  cities, 
  loading, 
  total,
  totalPages,
  currentPage,
  searchTerm,
  onPageChange,
  onSearchChange,
  onEdit, 
  onDelete 
}: CityListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  useRowActionMenu(openMenuId, setOpenMenuId);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this city group?")) {
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
            placeholder="Search states or cities..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={7} cols={5} />
      ) : cities.length === 0 ? (
        <div className="p-20 text-center text-slate-400 italic">No city groups found.</div>
      ) : (
        <div className={`${adminTableWrapClass} min-h-[350px]`}>
          <table className={adminTableClass}>
            <thead>
              <tr className="bg-th-bg border-b border-border-theme">
                <th className={adminTableHeadCellClass}>Image</th>
                <th className={adminTableHeadCellClass}>State</th>
                <th className={adminTableHeadCellClass}>Cities</th>
                <th className={adminTableHeadCellClass}>Created At</th>
                <th className={`${adminTableHeadCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {cities.map((city) => (
                <tr key={city._id} className="hover:bg-hover-theme transition-all duration-300 group border-b border-border-theme/50">
                  <td className={adminTableBodyCellClass}>
                    <div className="h-10 w-14 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                      {city.image ? <img src={city.image} className="h-full w-full object-cover" alt="" /> : <MapPin className="h-full w-full p-3 text-slate-200" />}
                    </div>
                  </td>
                  <td className={adminTableBodyCellClass}>
                    <span className="font-bold text-slate-900">{city.state}</span>
                  </td>
                  <td className={`${adminTableBodyCellClass} text-slate-500 text-sm`}>
                    {city.cities?.slice(0, 4).join(", ")} {city.cities?.length > 4 ? `+ ${city.cities.length - 4} more` : ""}
                  </td>
                  <td className={`${adminTableBodyCellClass} text-slate-500 text-sm`}>
                    {new Date(city.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className={`${adminTableBodyCellClass} text-right`}>
                    <div className="relative inline-flex justify-end" data-row-action>
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === city._id ? null : city._id)}
                        className="p-2 text-slate-400 hover:text-slate-900 transition rounded-xl"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      {openMenuId === city._id && (
                        <div className={`${rowActionDropdownClass} w-40`}>
                          <button
                            type="button"
                            onClick={() => { setOpenMenuId(null); onEdit(city); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Edit3 size={16} className="text-blue-600" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(city._id)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition"
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
      )}

      <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
          Showing {(currentPage - 1) * 10 + Math.min(1, cities.length)}-{Math.min(currentPage * 10, total)} of {total}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
