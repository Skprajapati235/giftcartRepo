"use client";

import CategoryView from "../components/category";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function CategoryPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <CategoryView />
      </AdminMain>
    </ProtectedRoute>
  );
}
