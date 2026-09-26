"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import RedirectsManager from "../../components/seo/RedirectsManager";

export default function RedirectsRoute() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <RedirectsManager />
      </AdminMain>
    </ProtectedRoute>
  );
}
