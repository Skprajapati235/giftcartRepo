"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";
import SupportManagementView from "../components/support";

export default function SupportPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <SupportManagementView />
      </AdminMain>
    </ProtectedRoute>
  );
}
