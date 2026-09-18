"use client";

import React from "react";
import { Edit2, Trash2, Search, Loader2, Briefcase } from "lucide-react"
import Pagination from "../Pagination";
interface CrmListProps {
  contacts: any[];
  loading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onEdit: (contact: any) => void;
  onDelete: (contact: any) => void;
}

export default function CrmList({
  contacts,
  loading,
  total,
  totalPages,
  currentPage,
  searchTerm,
  onPageChange,
  onSearchChange,
  onEdit,
  onDelete,
}: CrmListProps) {
  return (
    <div className="rounded-2xl border border-border-theme bg-card shadow-sm">
      <div className="border-b border-border-theme p-4 sm:p-6 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts by name, company..."
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
              <th className="px-6 py-4 font-medium">Contact Details</th>
              <th className="px-6 py-4 font-medium">Company/Role</th>
              <th className="px-6 py-4 font-medium">Type</th>
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
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  No contacts found.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact._id} className="transition hover:bg-hover-theme">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{contact.name}</div>
                    <div className="text-xs text-slate-500">{contact.email || "—"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{contact.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Briefcase size={14} className="text-slate-400" />
                      <span className="font-medium">{contact.company || "—"}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 ml-5">{contact.role || "—"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-900/30 dark:text-indigo-300">
                      {contact.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        contact.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                          : "bg-slate-50 text-slate-700 ring-slate-600/20"
                      }`}
                    >
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(contact)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-primary hover:shadow-sm dark:hover:bg-slate-800"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(contact)}
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
