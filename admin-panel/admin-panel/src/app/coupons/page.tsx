"use client";

import CouponsView from "../components/coupons";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function CouponsPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <CouponsView />
      </AdminMain>
    </ProtectedRoute>
  );
}
