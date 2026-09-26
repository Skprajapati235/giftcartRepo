"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import PagesSeoManager from "../../components/seo/PagesSeoManager";

export default function PagesSeoRoute() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <PagesSeoManager />
      </AdminMain>
    </ProtectedRoute>
  );
}
