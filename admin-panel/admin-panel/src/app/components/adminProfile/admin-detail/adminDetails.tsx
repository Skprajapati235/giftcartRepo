"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAdmin } from "../../../context/AdminContext";

export default function AdminDetails() {
    const router = useRouter();
    const params = useParams();
    const { admins } = useAdmin();
    const [admin, setAdmin] = useState<any>(null);

    useEffect(() => {
        const adminId = params.id;
        const foundAdmin = admins.find((a) => a._id === adminId);
        if (!foundAdmin) {
            router.push("/admins");
        } else {
            setAdmin(foundAdmin);
        }
    }, [params.id, admins, router]);

    if (!admin) return <div>Loading...</div>;

    return (
        <div className="flex justify-center mt-10">
            <section className="flex w-full gap-8 rounded-3xl bg-white p-8 shadow-sm">
                {/* Left: Profile Image & Basic Info */}
                <div className="flex flex-col items-center gap-4 w-1/3">
                    <img
                        src={admin.avatar || "https://via.placeholder.com/150"}
                        alt={admin.name}
                        className="h-32 w-32 rounded-full object-cover"
                    />
                    <h2 className="text-xl font-semibold text-slate-900">{admin.name}</h2>
                    <p className="text-slate-500 text-sm">{admin.role}</p>
                    <div className="flex gap-4 text-slate-600 mt-2">
                        <span>👤 {admin.totalUsers || 0}</span>
                        <span>📄 {admin.totalPosts || 0}</span>
                    </div>
                    <div className="mt-4 text-sm text-slate-600">
                        <p>Email: {admin.email}</p>
                        <p>Phone: {admin.phone || "—"}</p>
                        <p>Address: {admin.address || "—"}</p>
                    </div>
                </div>

                {/* Right: Editable Info */}
                <div className="flex w-2/3 flex-col gap-4">
                    <h3 className="text-lg font-semibold text-slate-900">Admin Details</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-slate-500 text-sm">Full Name</label>
                            <p className="mt-1 text-slate-900">{admin.name}</p>
                        </div>
                        <div>
                            <label className="block text-slate-500 text-sm">Email</label>
                            <p className="mt-1 text-slate-900">{admin.email}</p>
                        </div>
                        <div>
                            <label className="block text-slate-500 text-sm">Phone No</label>
                            <p className="mt-1 text-slate-900">{admin.phone || "—"}</p>
                        </div>
                        <div>
                            <label className="block text-slate-500 text-sm">City</label>
                            <p className="mt-1 text-slate-900">{admin.city || "—"}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-slate-500 text-sm">Address</label>
                            <p className="mt-1 text-slate-900">{admin.address || "—"}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-slate-500 text-sm">Message</label>
                            <p className="mt-1 text-slate-900">{admin.message || "—"}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/admins")}
                        className="mt-5 w-max rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Back
                    </button>
                </div>
            </section>
        </div>
    );
}