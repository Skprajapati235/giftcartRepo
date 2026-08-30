"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";
import WebsiteContacts from "@/components/websiteContact/websiteContacts";

export default function WebsiteContactPage() {
    return (
        <ProtectedRoute>
            <AdminMain>
                <div className="mb-6 lg:mb-8">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 sm:text-sm">
                        Website Contact Management
                    </p>
                </div>
                <WebsiteContacts />
            </AdminMain>
        </ProtectedRoute>
    );
}
