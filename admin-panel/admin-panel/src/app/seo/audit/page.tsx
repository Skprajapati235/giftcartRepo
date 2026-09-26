"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import SeoAuditDashboard from "../../components/seo/SeoAuditDashboard";

export default function SeoAuditRoute() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <SeoAuditDashboard />
      </AdminMain>
    </ProtectedRoute>
  );
}
