"use client";

import React, { useState } from "react";
import { TableSkeleton } from "../skeletonLoader/commonSkeleton";
import Pagination from "../Pagination";
import AdminEditForm from "./adminEdit";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/adminService";
import { adminTableWrapClass, adminTableClass, adminTableHeadCellClass, adminTableBodyCellClass } from "../ui/adminTable";
import { useRowActionMenu, rowActionDropdownClass } from "../ui/useRowActionMenu";

export default function AdminsPage() {
    const {
        data: admins,
        loading,
        error,
        total,
        totalPages,
        params,
        onPageChange,
        onSearchChange,
        refresh
    } = useResource<any>(service.getAdmins, "admins");

    const { user } = useAuth();
    const activeAdminId = user?._id || null;
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const router = useRouter();

    useRowActionMenu(openMenuId, setOpenMenuId);

    const deleteAdmin = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this admin?")) {
            try {
                await service.deleteAdmin(id);
                refresh();
            } catch (err) {
                alert("Failed to delete admin");
            }
        }
    };

    if (editingId) {
        // Show only edit form
        return <AdminEditForm adminId={editingId} onCancel={() => setEditingId(null)} />;
    }

    // Show admin list
    return (
        <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden min-h-[600px]">
            {/* Header */}
            <div className="p-6 border-b border-border-theme flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card relative z-10">
                <div className="relative w-full max-w-sm">
                    <input
                        type="text"
                        value={params.search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search name, email, city..."
                        className="w-full pl-4 pr-4 py-3 rounded-2xl border border-border-theme bg-background text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-background px-4 py-3 rounded-2xl border border-border-theme font-sans">
                    Total Admins: {total}
                </div>
            </div>

            {loading ? (
                <TableSkeleton rows={8} cols={5} />
            ) : error ? (
                <div className="p-20 text-center text-rose-500 italic">{error}</div>
            ) : admins.length === 0 ? (
                <div className="p-20 text-center text-slate-400 italic">No admins found.</div>
            ) : (
                <div className={`${adminTableWrapClass} min-h-[450px]`}>
                    <table className={adminTableClass}>
                        <thead>
                            <tr className="bg-th-bg border-b border-border-theme">
                                <th className={adminTableHeadCellClass}>Name</th>
                                <th className={adminTableHeadCellClass}>Email</th>
                                <th className={adminTableHeadCellClass}>City</th>
                                <th className={adminTableHeadCellClass}>Role</th>
                                <th className={`${adminTableHeadCellClass} text-right`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-theme">
                            {admins.map((admin) => (
                                <tr
                                    key={admin._id}
                                    className="hover:bg-hover-theme transition-all duration-300 group border-b border-border-theme/50"
                                >
                                    <td className="px-6 py-5 font-bold text-slate-900 flex items-center gap-2">
                                        {admin._id === activeAdminId && (
                                            <span
                                                className="h-3 w-3 rounded-full bg-green-800 blink-fast"
                                                title="Active"
                                            />
                                        )}
                                        {admin.name}
                                    </td>
                                    {/* <td className="px-6 py-5 font-bold text-slate-900">{admin.name}</td> */}
                                    <td className="px-6 py-5 text-slate-600 truncate">{admin.email}</td>
                                    <td className="px-6 py-5 text-slate-600">{admin.city || "—"}</td>
                                    <td className="px-6 py-5 text-slate-600">{admin.role}</td>
                                    <td className={`${adminTableBodyCellClass} text-right`}>
                                        <div className="relative inline-flex justify-end" data-row-action>
                                        <button
                                            type="button"
                                            onClick={() => setOpenMenuId(openMenuId === admin._id ? null : admin._id)}
                                            className="p-2 text-slate-400 hover:text-slate-900 transition rounded-xl"
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>

                                        {openMenuId === admin._id && (
                                            <div className={rowActionDropdownClass}>
                                                <button
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-white bg-primary hover:opacity-90 rounded-xl transition"
                                                    onClick={() => router.push(`/admins/${admin._id}`)}
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </button>
                                                <button
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                                                    onClick={() => setEditingId(admin._id)}
                                                >
                                                    <Edit size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition"
                                                    onClick={() => deleteAdmin(admin._id)}
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

            {/* Pagination */}
            <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
                    Showing {(params.page - 1) * 10 + Math.min(1, admins.length)}-{Math.min(params.page * 10, total)} of {total}
                </div>
                <Pagination currentPage={params.page} totalPages={totalPages} onPageChange={onPageChange} />
            </div>
        </div>
    );
}