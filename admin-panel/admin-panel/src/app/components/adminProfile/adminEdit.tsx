"use client";

import React, { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";

interface AdminEditFormProps {
    adminId: string;
    onCancel: () => void;
}

export default function AdminEditForm({ adminId, onCancel }: AdminEditFormProps) {
    const { admins, updateAdmin } = useAdmin();
    const [values, setValues] = useState({ name: "", email: "", city: "" });

    useEffect(() => {
        const admin = admins.find((a) => a._id === adminId);
        if (admin) {
            setValues({
                name: admin.name || "",
                email: admin.email || "",
                city: admin.city || "",
            });
        }
    }, [admins, adminId]);

    const saveEdit = async () => {
        await updateAdmin(adminId, values);
        onCancel();
    };

    return (
        <div className=" mt-10 p-6 rounded-3xl bg-white shadow-md">
            <h2 className="text-xl font-semibold mb-6">Edit Admin</h2>
            <div className="grid gap-4 sm:grid-cols-3">
                <input
                    value={values.name}
                    onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Name"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />
                <input
                    value={values.email}
                    onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />
                <input
                    value={values.city}
                    onChange={(e) => setValues((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />
            </div>

            <div className="mt-6 flex gap-3">
                <button
                    onClick={saveEdit}
                    className="bg-slate-900 text-white px-5 py-3 rounded-2xl hover:bg-slate-800 transition"
                >
                    Save
                </button>
                <button
                    onClick={onCancel}
                    className="bg-slate-200 text-slate-900 px-5 py-3 rounded-2xl hover:bg-slate-300 transition"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}