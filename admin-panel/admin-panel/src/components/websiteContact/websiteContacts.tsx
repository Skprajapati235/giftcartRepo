"use client";

import React, { useEffect, useState } from "react";
import { Search, MoreHorizontal, Trash2 } from "lucide-react";
import {
    rowActionDropdownClass,
    useRowActionMenu,
} from "@/app/components/ui/useRowActionMenu";
import { TableSkeleton } from "@/app/components/skeletonLoader/commonSkeleton";
import {
    adminTableBodyCellClass,
    adminTableClass,
    adminTableHeadCellClass,
    adminTableWrapClass,
} from "@/app/components/ui/adminTable";
import { getWebsiteContact, deleteContact } from "@/app/services/websiteContact";
import { useToast } from "@/context/ToastContext";

export default function WebsiteContacts() {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const { showToast } = useToast();

    useRowActionMenu(openMenuId, setOpenMenuId);

    const [webcontactdata, setWebContactData] = useState<any[]>([]);
    const [loading, setIsLoading] = useState(true);


    useEffect(() => {
        const fetchWebContactData = async () => {
            setIsLoading(true);

            try {
                const res = await getWebsiteContact();

                console.log("API Response:", res);

                // Agar API response { data: [...] } return karti hai
                setWebContactData(res?.data || []);
            } catch (error) {
                console.error("Data fetch karne me error aayi:", error);
                setWebContactData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWebContactData();
    }, []);

    console.log("webcontactdata:", webcontactdata);
    const handleDelete = async (id: string) => {
        try {
            await deleteContact(id);
            setWebContactData((prev) => prev.filter((c) => c._id !== id));
            showToast("Contact deleted successfully");
        } catch (error) {
            console.error("Delete karne me error aayi:", error);
            showToast("Failed to delete contact", "error");
        }
    };

    return (
        <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden">

            {/* Header */}
            <div className="p-6 border-b border-border-theme bg-card relative z-10">
                <div className="relative w-full max-w-sm">
                    <Search
                        className="absolute left-4 top-3.5 text-slate-400"
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder="Search email..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-theme bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <TableSkeleton rows={7} cols={3} />
            ) : webcontactdata.length === 0 ? (
                <div className="p-20 text-center text-slate-400 italic">
                    No contacts found.
                </div>
            ) : (
                <div className={`${adminTableWrapClass} min-h-[350px]`}>

                    <table className={adminTableClass}>

                        <thead>
                            <tr className="bg-th-bg border-b border-border-theme">

                                <th className={adminTableHeadCellClass}>
                                    Email
                                </th>

                                <th className={adminTableHeadCellClass}>
                                    Created At
                                </th>

                                <th
                                    className={`${adminTableHeadCellClass} text-right`}
                                >
                                    Actions
                                </th>

                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border-theme">

                            {webcontactdata.map((c: any) => (

                                <tr
                                    key={c._id}
                                    className="hover:bg-hover-theme transition-all duration-300 group border-b border-border-theme/50"
                                >

                                    {/* Email */}
                                    <td className="px-6 py-5">
                                        <span className="font-semibold text-slate-900">
                                            {c.email}
                                        </span>
                                    </td>

                                    {/* Created At */}
                                    <td className="px-6 py-5 text-slate-500 text-sm">
                                        {c.createdAt
                                            ? new Date(
                                                c.createdAt
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })
                                            : "-"}
                                    </td>

                                    {/* Actions */}
                                    <td
                                        className={`${adminTableBodyCellClass} text-right`}
                                    >
                                        <div
                                            className="relative inline-flex justify-end"
                                            data-row-action
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpenMenuId(
                                                        openMenuId === c._id
                                                            ? null
                                                            : c._id
                                                    )
                                                }
                                                className="p-2 text-slate-400 hover:text-slate-900 transition rounded-xl"
                                            >
                                                <MoreHorizontal size={20} />
                                            </button>

                                            {openMenuId === c._id && (
                                                <div
                                                    className={`${rowActionDropdownClass} w-40`}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(c._id)}
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
        </div>
    );
}