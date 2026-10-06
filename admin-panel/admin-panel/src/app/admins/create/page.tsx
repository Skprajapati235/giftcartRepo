"use client";

import AdminCreatePage from "@/app/components/adminProfile/AdminCreatePage";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import AdminMain from "@/app/components/AdminMain";

export default function CreateAdminRoute() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <AdminCreatePage />
      </AdminMain>
    </ProtectedRoute>
  );
}
