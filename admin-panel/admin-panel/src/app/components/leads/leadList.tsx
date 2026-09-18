"use client";

import React from "react";
import { Edit2, Trash2, Search, Loader2 } from "lucide-react";
import Pagination from "../Pagination";

interface LeadListProps {
  leads: any[];
  loading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onEdit: (lead: any) => void;
  onDelete: (lead: any) => void;
}

export default function LeadList({
  leads,
  loading,
  total,
  totalPages,
  currentPage,
  searchTerm,
  onPageChange,
  onSearchChange,
  onEdit,
  onDelete,
}: LeadListProps) {
  return (
    <div className="rounded-2xl border border-border-theme bg-card shadow-sm">
      <div className="border-b border-border-theme p-4 sm:p-6 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-border-theme bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Lead</th>
              <th className="px-6 py-4 font-medium">Source</th>
              <th className="px-6 py-4 font-medium">Interested In</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-theme">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id} className="transition hover:bg-hover-theme">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{lead.name}</div>
                    <div className="text-xs text-slate-500">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {lead.interestedProduct || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        lead.status === "NEW"
                          ? "bg-purple-50 text-purple-700 ring-purple-600/20"
                          : lead.status === "CONVERTED"
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : lead.status === "LOST"
                          ? "bg-rose-50 text-rose-700 ring-rose-600/20"
                          : "bg-orange-50 text-orange-700 ring-orange-600/20"
                      }`}
                    >
                      {lead.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(lead)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-primary hover:shadow-sm dark:hover:bg-slate-800"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(lead)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-rose-500 hover:shadow-sm dark:hover:bg-slate-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border-theme p-4 sm:p-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
