"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import GlobalSeoSettings from "../../components/seo/GlobalSeoSettings";

export default function GlobalSeoPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <GlobalSeoSettings />
      </AdminMain>
    </ProtectedRoute>
  );
}
