"use client";

import AdminProfiles from "../components/adminProfile/adminProfiles";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function AdminsPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <AdminProfiles />
      </AdminMain>
    </ProtectedRoute>
  );
}
