"use client";

import PaymentsView from "../components/payments";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function PaymentsPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <PaymentsView />
      </AdminMain>
    </ProtectedRoute>
  );
}
