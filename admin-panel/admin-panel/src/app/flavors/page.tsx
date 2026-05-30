"use client";

import FlavorsView from "../components/flavors";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function FlavorsPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <FlavorsView />
      </AdminMain>
    </ProtectedRoute>
  );
}
