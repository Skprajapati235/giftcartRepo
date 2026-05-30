"use client";

import DeveloperInformation from "../components/developer/developerInformation";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function DeveloperPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <DeveloperInformation />
      </AdminMain>
    </ProtectedRoute>
  );
}
