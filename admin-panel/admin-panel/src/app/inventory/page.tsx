"use client";

import InventoryView from "../components/inventory";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function InventoryPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <InventoryView />
      </AdminMain>
    </ProtectedRoute>
  );
}
