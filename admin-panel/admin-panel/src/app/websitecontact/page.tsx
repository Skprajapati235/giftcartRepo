"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";
import WebsiteContacts from "@/components/websiteContact/websiteContacts";

export default function WebsiteContactPage() {
    return (
        <ProtectedRoute>
            <AdminMain>
                <WebsiteContacts />
            </AdminMain>
        </ProtectedRoute>
    );
}
