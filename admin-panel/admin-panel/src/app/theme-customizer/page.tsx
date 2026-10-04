"use client";

import ThemeCustomizerView from "../components/theme/ThemeCustomizerView";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function ThemeCustomizerPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <ThemeCustomizerView />
      </AdminMain>
    </ProtectedRoute>
  );
}
